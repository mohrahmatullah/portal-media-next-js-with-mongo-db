"use client";

import { useState } from "react";
import Image from "next/image";

export type RelatedImage = { url: string; caption?: string; alt?: string; order: number };

export default function RelatedImagesEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: RelatedImage[];
}) {
  const [items, setItems] = useState<RelatedImage[]>(
    [...defaultValue].sort((a, b) => a.order - b.order)
  );
  const [busy, setBusy] = useState(false);

  async function add(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setItems((prev) => [...prev, { url: data.url, caption: "", alt: "", order: prev.length }]);
      }
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  function update(i: number, patch: Partial<RelatedImage>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function remove(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i).map((it, idx) => ({ ...it, order: idx })));
  }
  function move(i: number, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next.map((it, idx) => ({ ...it, order: idx }));
    });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Gambar terkait (galeri)</label>
        <label className="cursor-pointer rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">
          {busy ? "Mengunggah…" : "+ Tambah gambar"}
          <input type="file" accept="image/*" className="hidden" onChange={add} />
        </label>
      </div>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border bg-white p-3">
            <div className="relative h-16 w-24 overflow-hidden rounded">
              <Image src={it.url} alt={it.alt || ""} fill className="object-cover" sizes="96px" />
            </div>
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <input
                placeholder="Caption"
                value={it.caption ?? ""}
                onChange={(e) => update(i, { caption: e.target.value })}
                className="rounded border px-2 py-1 text-sm"
              />
              <input
                placeholder="Alt text"
                value={it.alt ?? ""}
                onChange={(e) => update(i, { alt: e.target.value })}
                className="rounded border px-2 py-1 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} className="rounded border px-2 text-xs">
                ↑
              </button>
              <button type="button" onClick={() => move(i, 1)} className="rounded border px-2 text-xs">
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded border border-red-200 px-2 text-xs text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400">Belum ada gambar terkait.</p>}
      </div>
      <input type="hidden" name={name} value={JSON.stringify(items)} readOnly />
    </div>
  );
}
