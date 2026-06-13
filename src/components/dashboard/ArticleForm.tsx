"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import ImageUploader from "@/components/dashboard/ImageUploader";
import RelatedImagesEditor, { type RelatedImage } from "@/components/dashboard/RelatedImagesEditor";
import type { ArticleFormState } from "@/lib/actions/articles";

type CategoryOption = { id: string; name: string };

export type ArticleDefaults = {
  title?: string;
  excerpt?: string;
  body?: string;
  coverImage?: string;
  categoryId?: string;
  tags?: string;
  video?: string;
  relatedImages?: RelatedImage[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
};

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

export default function ArticleForm({
  action,
  categories,
  defaults = {},
  submitLabel,
  serverError,
}: {
  action: (prev: ArticleFormState, fd: FormData) => Promise<ArticleFormState>;
  categories: CategoryOption[];
  defaults?: ArticleDefaults;
  submitLabel: string;
  serverError?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const error = state?.error ?? serverError;

  return (
    <form action={formAction} className="space-y-6">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Judul *</label>
            <input
              name="title"
              defaultValue={defaults.title}
              required
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ringkasan</label>
            <textarea
              name="excerpt"
              defaultValue={defaults.excerpt}
              rows={2}
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Konten (HTML / rich text)
            </label>
            <textarea
              name="body"
              defaultValue={defaults.body}
              rows={14}
              className="w-full rounded-lg border px-3 py-2.5 font-mono text-sm"
            />
          </div>
          <RelatedImagesEditor name="relatedImages" defaultValue={defaults.relatedImages} />
        </div>

        <div className="space-y-5">
          <ImageUploader name="coverImage" label="Gambar sampul (cover)" defaultUrl={defaults.coverImage} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Kategori *</label>
            <select
              name="categoryId"
              defaultValue={defaults.categoryId ?? ""}
              required
              className="w-full rounded-lg border px-3 py-2.5"
            >
              <option value="" disabled>
                Pilih kategori
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tag (pisahkan koma)</label>
            <input
              name="tags"
              defaultValue={defaults.tags}
              placeholder="politik, ekonomi"
              className="w-full rounded-lg border px-3 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Video (opsional)
            </label>
            <input
              name="video"
              defaultValue={defaults.video}
              placeholder="https://youtu.be/… (opsional)"
              className="w-full rounded-lg border px-3 py-2.5"
            />
            <p className="mt-1 text-xs text-gray-400">YouTube/Vimeo atau .mp4/.webm. Boleh kosong.</p>
          </div>

          <details className="rounded-lg border bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium">SEO (opsional)</summary>
            <div className="mt-3 space-y-3">
              <input name="metaTitle" defaultValue={defaults.metaTitle} placeholder="Meta title" className="w-full rounded border px-2 py-1.5 text-sm" />
              <textarea name="metaDescription" defaultValue={defaults.metaDescription} placeholder="Meta description" rows={2} className="w-full rounded border px-2 py-1.5 text-sm" />
              <input name="canonicalUrl" defaultValue={defaults.canonicalUrl} placeholder="Canonical URL" className="w-full rounded border px-2 py-1.5 text-sm" />
              <input name="ogImage" defaultValue={defaults.ogImage} placeholder="OG image URL" className="w-full rounded border px-2 py-1.5 text-sm" />
            </div>
          </details>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Submit label={submitLabel} />
        <Link href="/dashboard/articles" className="text-sm text-gray-500 hover:underline">
          Batal
        </Link>
      </div>
    </form>
  );
}
