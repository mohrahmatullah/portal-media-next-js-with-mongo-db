import { getHomepage } from "@/lib/queries";
import { recordVisit } from "@/lib/analytics";
import ArticleCard from "@/components/public/ArticleCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  recordVisit("home");
  let data: Awaited<ReturnType<typeof getHomepage>> | null = null;
  try {
    data = await getHomepage();
  } catch {
    data = null;
  }

  if (!data || (!data.headline && data.latest.length === 0)) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Belum ada berita yang dipublikasikan</h1>
        <p className="mt-2 text-gray-500">
          Jalankan seeder (<code>npm run db:seed</code>) atau publikasikan berita dari dashboard.
        </p>
      </div>
    );
  }

  const { headline, featured, latest } = data;

  return (
    <div className="container py-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {headline ? (
            <ArticleCard article={headline} variant="hero" />
          ) : (
            latest[0] && <ArticleCard article={latest[0]} variant="hero" />
          )}
        </div>
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase text-gray-400">Unggulan</h2>
          {featured.length > 0
            ? featured.map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)
            : latest.slice(1, 5).map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-5 border-l-4 border-brand-600 pl-3 text-xl font-bold">Berita Terbaru</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>
    </div>
  );
}
