import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCategoryWithArticles } from "@/lib/queries";
import { recordVisit } from "@/lib/analytics";
import ArticleCard from "@/components/public/ArticleCard";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  recordVisit("category");
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const data = await getCategoryWithArticles(slug, page).catch(() => null);
  if (!data) notFound();

  const { category, articles, total, perPage } = data;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-gray-100">
          <Image src={category.image} alt={category.name} fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold">{category.name}</h1>
          <p className="text-sm text-gray-400">{total} berita</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      {articles.length === 0 && <p className="text-gray-400">Belum ada berita di kategori ini.</p>}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            return (
              <Link
                key={p}
                href={`/kategori/${category.slug}?page=${p}`}
                className={
                  p === page
                    ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white"
                    : "rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                }
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
