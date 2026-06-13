import Image from "next/image";
import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import CategoryForm from "@/components/dashboard/CategoryForm";
import { createCategory, deleteCategory } from "@/lib/actions/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  await requirePermission("categories.manage");
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { articles: true } } },
  });

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Kategori</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-2 text-sm font-medium text-gray-500">Tambah kategori</h2>
          <CategoryForm action={createCategory} />
        </div>
        <div className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border bg-white p-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                  <Image src={c.image} alt={c.name} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-gray-400">{c._count.articles} berita</p>
                </div>
                <form action={deleteCategory.bind(null, c.id)}>
                  <button
                    className="text-xs text-red-600 hover:underline disabled:text-gray-300"
                    disabled={c._count.articles > 0}
                    title={c._count.articles > 0 ? "Masih ada berita pada kategori ini" : "Hapus"}
                  >
                    Hapus
                  </button>
                </form>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-gray-400">Belum ada kategori.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
