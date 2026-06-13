import { searchArticles } from "@/lib/queries";
import ArticleCard from "@/components/public/ArticleCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pencarian" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();
  const results = q ? await searchArticles(q).catch(() => []) : [];

  return (
    <div className="container py-8">
      <form action="/cari" className="mb-8">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari berita…"
          className="w-full rounded-full border px-5 py-3 text-lg outline-none focus:border-brand-400"
        />
      </form>

      {q ? (
        <>
          <h1 className="mb-5 text-xl font-bold">
            {results.length} hasil untuk “{q}”
          </h1>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          {results.length === 0 && <p className="text-gray-400">Tidak ada hasil.</p>}
        </>
      ) : (
        <p className="text-gray-400">Masukkan kata kunci untuk mencari berita.</p>
      )}
    </div>
  );
}
