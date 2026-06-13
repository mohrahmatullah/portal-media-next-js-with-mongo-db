"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import ImageUploader from "@/components/dashboard/ImageUploader";
import { updateProfile } from "@/lib/actions/profile";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Menyimpan…" : "Simpan profil"}
    </button>
  );
}

export default function ProfileForm({
  defaults,
}: {
  defaults: { displayName: string; photoUrl: string };
}) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-white p-5">
      {state?.error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Profil tersimpan.</p>}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Nama tampilan *</label>
        <input
          name="displayName"
          defaultValue={defaults.displayName}
          required
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <ImageUploader name="photoUrl" label="Foto profil" defaultUrl={defaults.photoUrl} />
      <Submit />
    </form>
  );
}
