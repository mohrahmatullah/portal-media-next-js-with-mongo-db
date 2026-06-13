import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export type UploadResult = { url: string; contentType: string };

export function validateImage(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, atau AVIF.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Ukuran file melebihi batas 5MB.";
  }
  return null;
}

/**
 * Store an uploaded image. Default strategy is the local `public/uploads`
 * folder (dev). In production this would push to an object store/CDN and
 * return the CDN URL instead — the rest of the app only depends on the
 * returned URL string.
 */
export async function storeImage(file: File): Promise<UploadResult> {
  const error = validateImage({ type: file.type, size: file.size });
  if (error) throw new Error(error);

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const safeName = `${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, safeName), buffer);

  return { url: `/uploads/${safeName}`, contentType: file.type };
}
