import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/context";
import prisma from "@/lib/prisma";
import ArticleForm from "@/components/dashboard/ArticleForm";
import { updateArticle } from "@/lib/actions/articles";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requirePermission("articles.manage");
  const { id } = await params;
  const { error } = await searchParams;
  const [article, categories, tags] = await Promise.all([
    prisma.article.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany(),
  ]);
  if (!article) notFound();

  const tagNames = tags
    .filter((t) => article.tagIds.includes(t.id))
    .map((t) => t.name)
    .join(", ");

  const serverError =
    error === "cover"
      ? "Tidak bisa publish: gambar sampul (cover) wajib diisi."
      : undefined;

  return (
    <div>
      <h1 className="mb-5 text-2xl font-bold">Edit berita</h1>
      <ArticleForm
        action={updateArticle.bind(null, article.id)}
        categories={categories}
        submitLabel="Simpan perubahan"
        serverError={serverError}
        defaults={{
          title: article.title,
          excerpt: article.excerpt ?? "",
          body: article.body,
          coverImage: article.coverImage ?? "",
          categoryId: article.categoryId,
          tags: tagNames,
          video: article.video?.url ?? "",
          relatedImages: article.relatedImages.map((r, i) => ({
            url: r.url,
            caption: r.caption ?? "",
            alt: r.alt ?? "",
            order: r.order ?? i,
          })),
          metaTitle: article.seo?.metaTitle ?? "",
          metaDescription: article.seo?.metaDescription ?? "",
          canonicalUrl: article.seo?.canonicalUrl ?? "",
          ogImage: article.seo?.ogImage ?? "",
        }}
      />
    </div>
  );
}
