import Link from "next/link";
import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import {
  setPublishStatus,
  setHeadline,
  toggleFeatured,
  deleteArticle,
} from "@/lib/actions/articles";

export const dynamic = "force-dynamic";

export default async function ArticlesListPage() {
  await requirePermission("articles.manage");
  const articles = await prisma.article.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true, author: true },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Berita</h1>
        <Link
          href="/dashboard/articles/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Tulis berita
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Penanda</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {articles.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-gray-400">oleh {a.author.displayName}</div>
                </td>
                <td className="px-4 py-3">{a.category?.name ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      a.status === "published"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                        : "rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    }
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {a.isHeadline && <span className="mr-1 rounded bg-amber-100 px-1.5 py-0.5 text-amber-700">Headline</span>}
                  {a.isFeatured && <span className="rounded bg-brand-100 px-1.5 py-0.5 text-brand-700">Unggulan</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/articles/${a.id}/edit`} className="text-brand-600 hover:underline">
                      Edit
                    </Link>
                    <form action={setPublishStatus.bind(null, a.id, a.status !== "published")}>
                      <button className="text-gray-600 hover:underline">
                        {a.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                    </form>
                    <form action={setHeadline.bind(null, a.id)}>
                      <button className="text-amber-600 hover:underline">Headline</button>
                    </form>
                    <form action={toggleFeatured.bind(null, a.id)}>
                      <button className="text-brand-600 hover:underline">Unggulan</button>
                    </form>
                    <form action={deleteArticle.bind(null, a.id)}>
                      <button className="text-red-600 hover:underline">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  Belum ada berita.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
