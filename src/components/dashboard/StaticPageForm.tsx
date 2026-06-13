"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import type { PageFormState } from "@/lib/actions/pages";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : label}
    </button>
  );
}

export default function StaticPageForm({
  action,
  defaults = {},
  submitLabel,
}: {
  action: (prev: PageFormState, fd: FormData) => Promise<PageFormState>;
  defaults?: {
    title?: string;
    slug?: string;
    body?: string;
    published?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
  };
  submitLabel: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="max-w-2xl space-y-4">
      {state?.error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Judul *</label>
        <input name="title" defaultValue={defaults.title} required className="w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Slug (URL)</label>
        <input name="slug" defaultValue={defaults.slug} placeholder="about-us" className="w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Konten (HTML)</label>
        <textarea name="body" defaultValue={defaults.body} rows={12} className="w-full rounded-lg border px-3 py-2 font-mono text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="published" defaultChecked={defaults.published ?? true} />
        Terbitkan halaman ini
      </label>
      <details className="rounded-lg border bg-white p-3">
        <summary className="cursor-pointer text-sm font-medium">SEO (opsional)</summary>
        <div className="mt-3 space-y-3">
          <input name="metaTitle" defaultValue={defaults.metaTitle} placeholder="Meta title" className="w-full rounded border px-2 py-1.5 text-sm" />
          <textarea name="metaDescription" defaultValue={defaults.metaDescription} placeholder="Meta description" rows={2} className="w-full rounded border px-2 py-1.5 text-sm" />
          <input name="ogImage" defaultValue={defaults.ogImage} placeholder="OG image URL" className="w-full rounded border px-2 py-1.5 text-sm" />
        </div>
      </details>
      <div className="flex items-center gap-3">
        <Submit label={submitLabel} />
        <Link href="/dashboard/pages" className="text-sm text-gray-500 hover:underline">Batal</Link>
      </div>
    </form>
  );
}
