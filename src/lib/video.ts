import type { VideoType } from "@prisma/client";

export type ParsedVideo = { type: VideoType; url: string; provider: string | null };

const UPLOAD_EXT = /\.(mp4|webm|ogg|mov)$/i;

/**
 * Validate/normalize an optional article video. Returns:
 *  - `null` when no video is provided (videos are optional),
 *  - a ParsedVideo when valid,
 *  - throws Error(message) when a value is provided but unsupported.
 */
export function parseVideoInput(raw: string | null | undefined): ParsedVideo | null {
  const value = (raw ?? "").trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("URL video tidak valid.");
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    if (!id) throw new Error("URL YouTube tidak memuat id video.");
    return { type: "embed", url: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    if (!id) throw new Error("URL YouTube tidak memuat id video.");
    return { type: "embed", url: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (!id) throw new Error("URL Vimeo tidak memuat id video.");
    return { type: "embed", url: `https://player.vimeo.com/video/${id}`, provider: "vimeo" };
  }

  // Direct uploaded/hosted file
  if (UPLOAD_EXT.test(url.pathname)) {
    return { type: "upload", url: value, provider: null };
  }

  throw new Error(
    "Video tidak didukung. Gunakan tautan YouTube/Vimeo atau file .mp4/.webm/.ogg."
  );
}
