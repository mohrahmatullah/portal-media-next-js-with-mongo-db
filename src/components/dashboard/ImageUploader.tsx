"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Reusable image picker/uploader. Uploads to /api/upload and writes the
 * resulting URL into a hidden input named `name` so it submits with the form.
 */
export default function ImageUploader({
  name,
  label,
  defaultUrl = "",
  required = false,
}: {
  name: string;
  label: string;
  defaultUrl?: string;
  required?: boolean;
}) {
  const [url, setUrl] = useState(defaultUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengunggah.");
      setUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-32 overflow-hidden rounded-lg border border-dashed border-gray-300 bg-gray-50">
          {url ? (
            <Image src={url} alt="preview" fill className="object-cover" sizes="128px" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-gray-400">
              Belum ada
            </span>
          )}
        </div>
        <div className="flex-1">
          <input type="file" accept="image/*" onChange={onChange} className="text-sm" />
          {busy && <p className="mt-1 text-xs text-gray-500">Mengunggah…</p>}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <input type="hidden" name={name} value={url} readOnly required={required} />
    </div>
  );
}
