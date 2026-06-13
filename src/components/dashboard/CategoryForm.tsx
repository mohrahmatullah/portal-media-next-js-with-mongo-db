"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ImageUploader from "@/components/dashboard/ImageUploader";
import type { CategoryFormState } from "@/lib/actions/categories";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : label}
    </button>
  );
}

export default function CategoryForm({
  action,
  defaults,
  submitLabel = "Tambah kategori",
}: {
  action: (prev: CategoryFormState, fd: FormData) => Promise<CategoryFormState>;
  defaults?: { name?: string; image?: string };
  submitLabel?: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-3 rounded-xl border bg-white p-4">
      {state?.error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Tersimpan.</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nama kategori *</label>
        <input name="name" defaultValue={defaults?.name} required className="w-full rounded-lg border px-3 py-2" />
      </div>
      <ImageUploader name="image" label="Gambar kategori" defaultUrl={defaults?.image} required />
      <Submit label={submitLabel} />
    </form>
  );
}
