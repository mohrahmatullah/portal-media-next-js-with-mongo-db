import Link from "next/link";
import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import { deleteStaticPage } from "@/lib/actions/pages";

export const dynamic = "force-dynamic";

export default async function StaticPagesListPage() {
  await requirePermission("pages.manage");
  const pages = await prisma.staticPage.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Halaman Statis</h1>
        <Link href="/dashboard/pages/new" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          + Halaman baru
        </Link>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {pages.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3 text-gray-500">/{p.slug}</td>
                <td className="px-4 py-3">{p.published ? "Terbit" : "Draft"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/dashboard/pages/${p.id}/edit`} className="text-brand-600 hover:underline">Edit</Link>
                    <Link href={`/${p.slug}`} className="text-gray-500 hover:underline" target="_blank">Lihat</Link>
                    <form action={deleteStaticPage.bind(null, p.id)}>
                      <button className="text-red-600 hover:underline">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">Belum ada halaman.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
