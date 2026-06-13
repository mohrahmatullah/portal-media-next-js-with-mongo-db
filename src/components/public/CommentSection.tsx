import Link from "next/link";
import Image from "next/image";
import CommentForm from "@/components/public/CommentForm";

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  user: { displayName: string; photoUrl: string | null };
};

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function CommentSection({
  articleId,
  slug,
  comments,
  reader,
}: {
  articleId: string;
  slug: string;
  comments: Comment[];
  reader: { displayName: string } | null;
}) {
  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="mb-5 text-xl font-bold">Komentar ({comments.length})</h2>

      {reader ? (
        <div className="mb-8">
          <CommentForm articleId={articleId} slug={slug} />
        </div>
      ) : (
        <div className="mb-8 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
          Silakan{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            masuk
          </Link>{" "}
          untuk ikut berkomentar.
        </div>
      )}

      <ul className="space-y-5">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3">
            <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-brand-100">
              {c.user.photoUrl ? (
                <Image src={c.user.photoUrl} alt={c.user.displayName} fill sizes="36px" className="object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-xs font-semibold text-brand-700">
                  {initials(c.user.displayName)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm">
                <span className="font-semibold">{c.user.displayName}</span>{" "}
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </p>
              <p className="mt-1 text-sm text-gray-700">{c.body}</p>
            </div>
          </li>
        ))}
        {comments.length === 0 && <p className="text-sm text-gray-400">Belum ada komentar.</p>}
      </ul>
    </section>
  );
}
