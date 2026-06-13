"use client";

import Link from "next/link";
import { useState } from "react";
import clsx from "clsx";

type Cat = { name: string; slug: string };

export default function Header({
  categories,
  reader,
}: {
  categories: Cat[];
  reader: { displayName: string } | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-700">
          Portal<span className="text-gray-900">Media</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {categories.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className="text-sm font-medium text-gray-600 hover:text-brand-600"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <form action="/cari" className="relative">
            <input
              name="q"
              placeholder="Cari berita…"
              className="w-44 rounded-full border border-gray-200 px-4 py-1.5 text-sm outline-none focus:border-brand-400"
            />
          </form>
          {reader ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Halo, {reader.displayName}</span>
              <form action="/api/reader/logout" method="post">
                <button className="text-sm text-gray-500 hover:text-brand-600">Keluar</button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Masuk
            </Link>
          )}
        </div>

        <button
          className="md:hidden"
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-6 bg-gray-800" />
            <span className="block h-0.5 w-6 bg-gray-800" />
            <span className="block h-0.5 w-6 bg-gray-800" />
          </div>
        </button>
      </div>

      <div className={clsx("border-t md:hidden", open ? "block" : "hidden")}>
        <div className="container space-y-1 py-3">
          <form action="/cari" className="mb-2">
            <input
              name="q"
              placeholder="Cari berita…"
              className="w-full rounded-full border px-4 py-2 text-sm outline-none"
            />
          </form>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/kategori/${c.slug}`}
              className="block rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {c.name}
            </Link>
          ))}
          {reader ? (
            <form action="/api/reader/logout" method="post">
              <button className="px-2 py-2 text-sm text-gray-600">Keluar</button>
            </form>
          ) : (
            <Link href="/login" className="block px-2 py-2 text-sm font-medium text-brand-600">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
