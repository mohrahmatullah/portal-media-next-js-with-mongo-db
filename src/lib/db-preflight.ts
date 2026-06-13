/**
 * Database preflight check.
 *
 * Prisma 5's MongoDB connector emits `update` operations as aggregation
 * pipelines (`update.updates.u` is an array). That form is only accepted by
 * MongoDB 4.2+. On MongoDB 4.0.x every update/upsert fails with:
 *   Error code 14 (TypeMismatch): BSON field 'update.updates.u' is the wrong
 *   type 'array', expected type 'object'
 *
 * This module connects, verifies the server is MongoDB >= 4.2 AND a replica
 * set with a reachable primary, and fails fast with an actionable message so
 * the real failure surfaces here instead of mid-request/mid-seed.
 *
 * Run directly:  ts-node -P prisma/tsconfig.json src/lib/db-preflight.ts
 */
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const MIN_MAJOR = 4;
const MIN_MINOR = 2;
const TIMEOUT_MS = 5000;

/** Minimal .env loader so this can run as a bare `predev` script (no dotenv dep). */
function loadEnv(): void {
  if (process.env.DATABASE_URL) return;
  for (const name of [".env.local", ".env"]) {
    const file = join(process.cwd(), name);
    if (!existsSync(file)) continue;
    for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
  }
}

export class PreflightError extends Error {}

function hostFromUrl(url: string | undefined): string {
  if (!url) return "(DATABASE_URL not set)";
  const m = url.match(/mongodb(?:\+srv)?:\/\/(?:[^@]*@)?([^/?]+)/i);
  return m ? m[1] : url;
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new PreflightError(`Timed out after ${ms}ms ${label}`)), ms),
    ),
  ]);
}

/**
 * Throws PreflightError on any non-compliant / unreachable state.
 * Resolves silently when the database is MongoDB >= 4.2 replica set with a primary.
 */
export async function assertDatabaseReady(): Promise<void> {
  loadEnv();
  const host = hostFromUrl(process.env.DATABASE_URL);
  const prisma = new PrismaClient({ log: ["error"] });

  try {
    // `isMaster` and `buildInfo` run against any database (no admin needed).
    // `isMaster` (vs the newer `hello`) is understood by every MongoDB version,
    // so it doubles as the connectivity probe without a noisy fallback.
    const hello = (await withTimeout(
      prisma.$runCommandRaw({ isMaster: 1 }) as Promise<Record<string, unknown>>,
      TIMEOUT_MS,
      "connecting to MongoDB",
    )) as Record<string, unknown>;

    const build = (await withTimeout(
      prisma.$runCommandRaw({ buildInfo: 1 }) as Promise<Record<string, unknown>>,
      TIMEOUT_MS,
      "reading server version",
    )) as Record<string, unknown>;

    // --- Version check ---
    const versionArray = (build.versionArray as number[] | undefined) ?? [];
    const version = ((build.version as string | undefined) ?? versionArray.join(".")) || "unknown";
    const [major = 0, minor = 0] = versionArray;
    const versionOk = major > MIN_MAJOR || (major === MIN_MAJOR && minor >= MIN_MINOR);
    if (!versionOk) {
      throw new PreflightError(
        `MongoDB at ${host} is version ${version}, but >= ${MIN_MAJOR}.${MIN_MINOR} is required.\n` +
          `  Prisma sends updates as aggregation pipelines, which ${version} rejects with\n` +
          `  "TypeMismatch: 'update.updates.u' is the wrong type 'array'".`,
      );
    }

    // --- Replica set check ---
    const setName = hello.setName as string | undefined;
    if (!setName) {
      throw new PreflightError(
        `MongoDB at ${host} is a standalone server (not a replica set).\n` +
          `  Prisma's MongoDB connector requires a replica set for writes.`,
      );
    }
    const isPrimary = hello.isWritablePrimary === true || hello.ismaster === true;
    const primaryKnown = typeof hello.primary === "string" && (hello.primary as string).length > 0;
    if (!isPrimary && !primaryKnown) {
      throw new PreflightError(
        `Replica set "${setName}" at ${host} has no reachable primary (election in progress or members down).`,
      );
    }
  } catch (err) {
    if (err instanceof PreflightError) throw err;
    // Connection refused / DNS / auth, etc.
    throw new PreflightError(`Could not reach MongoDB at ${host}: ${(err as Error).message}`);
  } finally {
    await prisma.$disconnect();
  }
}

const REMEDIATION =
  "\nFix:\n" +
  "  • Use MongoDB 4.2+ as a replica set (MongoDB Atlas, or a local single-node replica set).\n" +
  "  • Laragon's bundled MongoDB 4.0.3 is NOT supported.\n" +
  "  • Then set DATABASE_URL in .env to point at it.\n" +
  "  • See README.md → \"Database setup (MongoDB replica set)\".\n";

// CLI runner: used by `predev` and `db:seed`.
if (require.main === module) {
  assertDatabaseReady()
    .then(() => process.exit(0))
    .catch((err: Error) => {
      console.error("\n✗ Database preflight failed.\n");
      console.error("  " + err.message.replace(/\n/g, "\n  "));
      console.error(REMEDIATION);
      process.exit(1);
    });
}
