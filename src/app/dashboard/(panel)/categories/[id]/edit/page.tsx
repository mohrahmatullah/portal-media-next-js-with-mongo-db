import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import CategoryForm from "@/components/dashboard/CategoryForm";
import { updateCategory } from "@/lib/actions/categories";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("categories.manage");
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="max-w-md">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/dashboard/categories" className="text-sm text-gray-500 hover:underline">
          &larr; Kategori
        </Link>
      </div>
      <h1 className="mb-5 text-2xl font-bold">Edit kategori</h1>
      <CategoryForm
        action={updateCategory.bind(null, category.id)}
        submitLabel="Simpan perubahan"
        defaults={{ name: category.name, image: category.image }}
      />
    </div>
  );
}
