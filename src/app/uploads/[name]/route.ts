import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

/**
 * Serve runtime-uploaded images from `public/uploads`. In production
 * (`next start`) the static `public/` folder does not serve files written
 * after boot, so next/image's optimizer 404s on them. This handler reads the
 * file from disk on demand and returns it with the correct content-type.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  // Reject anything that isn't a plain filename (no path traversal/segments).
  if (!/^[A-Za-z0-9._-]+$/.test(name) || name.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", name);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });

    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream";
    const file = await readFile(filePath);

    return new NextResponse(file, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
