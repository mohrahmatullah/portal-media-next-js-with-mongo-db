<#
.SYNOPSIS
  Start a local MongoDB 4.2+ single-node replica set for development and
  initiate `rs0` if it isn't already.

.DESCRIPTION
  Prisma's MongoDB connector requires MongoDB 4.2+ running as a replica set.
  Laragon's bundled MongoDB 4.0.3 is NOT sufficient (updates fail with a
  TypeMismatch on 'update.updates.u'). Point -MongodPath / -ShellPath at a
  4.2+ install (or put them on PATH).

.EXAMPLE
  .\scripts\mongo-dev.ps1
  .\scripts\mongo-dev.ps1 -Port 27017 -DbPath C:\data\portal-media
  .\scripts\mongo-dev.ps1 -MongodPath "C:\mongodb-6.0\bin\mongod.exe" -ShellPath "C:\mongodb-6.0\bin\mongosh.exe"
#>
param(
  [int]    $Port       = 27017,
  [string] $DbPath     = (Join-Path (Get-Location) ".mongo-data"),
  [string] $ReplSet    = "rs0",
  [string] $MongodPath = "mongod",      # 4.2+ mongod; override if not on PATH
  [string] $ShellPath  = ""             # mongosh or legacy mongo; auto-detected if empty
)

$ErrorActionPreference = "Stop"

function Resolve-Shell {
  if ($ShellPath -and (Test-Path $ShellPath)) { return $ShellPath }
  foreach ($c in @("mongosh", "mongo")) {
    $cmd = Get-Command $c -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
  }
  throw "No Mongo shell found. Install mongosh (or legacy mongo) or pass -ShellPath."
}

if (-not (Test-Path $DbPath)) {
  New-Item -ItemType Directory -Path $DbPath | Out-Null
  Write-Host "Created data dir: $DbPath"
}

# Start mongod as a replica set (background) if nothing is listening on $Port.
$listening = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
if ($listening) {
  Write-Host "Something is already listening on port $Port; assuming mongod is running."
} else {
  Write-Host "Starting mongod ($MongodPath) replSet=$ReplSet port=$Port dbpath=$DbPath ..."
  Start-Process -FilePath $MongodPath `
    -ArgumentList @("--replSet", $ReplSet, "--dbpath", $DbPath, "--port", "$Port", "--bind_ip", "127.0.0.1") `
    -WindowStyle Minimized
}

# Wait for the port to accept connections.
$deadline = (Get-Date).AddSeconds(30)
do {
  Start-Sleep -Milliseconds 500
  $up = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
} while (-not $up -and (Get-Date) -lt $deadline)
if (-not $up) { throw "mongod did not start listening on port $Port within 30s." }

$shell = Resolve-Shell
Write-Host "Using shell: $shell"

# Initiate the replica set only if it isn't already initiated.
$check = "try { rs.status().ok } catch (e) { e.codeName }"
$status = & $shell "--port" "$Port" "--quiet" "--eval" $check 2>&1 | Out-String
if ($status -match "NotYetInitialized" -or $status -match "no replset config") {
  Write-Host "Initiating replica set $ReplSet ..."
  $init = "rs.initiate({_id:'$ReplSet',members:[{_id:0,host:'127.0.0.1:$Port'}]})"
  & $shell "--port" "$Port" "--quiet" "--eval" $init
} else {
  Write-Host "Replica set already initiated (status: $($status.Trim()))."
}

Write-Host ""
Write-Host "Ready. Set DATABASE_URL to:"
Write-Host "  mongodb://127.0.0.1:$Port/portal_media?replicaSet=$ReplSet"
