"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { postComment, type CommentFormState } from "@/lib/actions/comments";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
    >
      {pending ? "Mengirim…" : "Kirim komentar"}
    </button>
  );
}

export default function CommentForm({ articleId, slug }: { articleId: string; slug: string }) {
  const action = postComment.bind(null, articleId, slug);
  const [state, formAction] = useActionState<CommentFormState, FormData>(action, undefined);
  return (
    <form action={formAction} className="space-y-3">
      {state?.error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      {state?.ok && <p className="rounded bg-green-50 px-3 py-2 text-sm text-green-700">Komentar terkirim.</p>}
      <textarea
        name="body"
        rows={3}
        required
        placeholder="Tulis komentar…"
        className="w-full rounded-lg border px-3 py-2 outline-none focus:border-brand-400"
      />
      <Submit />
    </form>
  );
}
