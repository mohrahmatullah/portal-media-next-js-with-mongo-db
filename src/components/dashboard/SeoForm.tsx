"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ImageUploader from "@/components/dashboard/ImageUploader";
import { updateSiteSeo } from "@/lib/actions/seo";
import type { SiteSeo } from "@/lib/seo";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : "Simpan pengaturan"}
    </button>
  );
}

export default function SeoForm({ defaults }: { defaults: SiteSeo }) {
  const [state, formAction] = useActionState(updateSiteSeo, undefined);
  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-5">
      {state?.error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Tersimpan.</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nama situs *</label>
        <input name="siteName" defaultValue={defaults.siteName} required className="w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Template judul</label>
        <input name="titleTemplate" defaultValue={defaults.titleTemplate} className="w-full rounded-lg border px-3 py-2" />
        <p className="mt-1 text-xs text-gray-400">Gunakan <code>%s</code> sebagai placeholder judul halaman.</p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi default</label>
        <textarea name="defaultDescription" defaultValue={defaults.defaultDescription} rows={3} className="w-full rounded-lg border px-3 py-2" />
      </div>
      <ImageUploader name="defaultOgImage" label="OG image default" defaultUrl={defaults.defaultOgImage ?? ""} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="indexingEnabled" defaultChecked={defaults.indexingEnabled} />
        Izinkan mesin pencari mengindeks situs
      </label>
      <Submit />
    </form>
  );
}
