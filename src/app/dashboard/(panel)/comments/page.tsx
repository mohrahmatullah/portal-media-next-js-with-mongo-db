import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import { setCommentStatus, deleteComment } from "@/lib/actions/comments";

export const dynamic = "force-dynamic";

export default async function CommentsModerationPage() {
  await requirePermission("comments.moderate");
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, article: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Komentar</h1>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-4 rounded-xl border bg-white p-4">
            <div>
              <p className="text-sm">
                <span className="font-semibold">{c.user.displayName}</span>{" "}
                <span className="text-xs text-gray-400">pada “{c.article.title}”</span>
              </p>
              <p className="mt-1 text-sm text-gray-700">{c.body}</p>
              <span
                className={
                  c.status === "visible"
                    ? "mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                    : "mt-2 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600"
                }
              >
                {c.status}
              </span>
            </div>
            <div className="flex flex-shrink-0 items-center gap-2 text-sm">
              {c.status === "visible" ? (
                <form action={setCommentStatus.bind(null, c.id, "hidden")}>
                  <button className="text-amber-600 hover:underline">Sembunyikan</button>
                </form>
              ) : (
                <form action={setCommentStatus.bind(null, c.id, "visible")}>
                  <button className="text-green-600 hover:underline">Tampilkan</button>
                </form>
              )}
              <form action={deleteComment.bind(null, c.id)}>
                <button className="text-red-600 hover:underline">Hapus</button>
              </form>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-gray-400">Belum ada komentar.</p>}
      </div>
    </div>
  );
}
