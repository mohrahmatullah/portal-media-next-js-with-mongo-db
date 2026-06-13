import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import ArticleForm from "@/components/dashboard/ArticleForm";
import { createArticle } from "@/lib/actions/articles";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  await requirePermission("articles.manage");
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Tulis berita</h1>
      <ArticleForm action={createArticle} categories={categories} submitLabel="Simpan draft" />
    </div>
  );
}
