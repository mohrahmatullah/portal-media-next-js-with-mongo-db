import Link from "next/link";
import Image from "next/image";

type Article = {
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  category?: { name: string; slug: string } | null;
  author?: { displayName: string } | null;
};

function fmtDate(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default function ArticleCard({
  article,
  variant = "default",
}: {
  article: Article;
  variant?: "default" | "compact" | "hero";
}) {
  if (variant === "hero") {
    return (
      <Link href={`/berita/${article.slug}`} className="group relative block overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] w-full">
          {article.coverImage && (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <div className="absolute bottom-0 p-6 text-white">
          {article.category && (
            <span className="mb-2 inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold">
              {article.category.name}
            </span>
          )}
          <h2 className="max-w-2xl text-2xl font-bold leading-tight md:text-3xl">{article.title}</h2>
          <p className="mt-2 text-sm text-gray-200">
            {article.author?.displayName} · {fmtDate(article.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/berita/${article.slug}`} className="group flex gap-3">
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {article.coverImage && (
            <Image src={article.coverImage} alt={article.title} fill sizes="96px" className="object-cover" />
          )}
        </div>
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold group-hover:text-brand-600">{article.title}</h3>
          <p className="mt-1 text-xs text-gray-400">{fmtDate(article.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/berita/${article.slug}`} className="group block overflow-hidden rounded-xl border bg-white transition hover:shadow-md">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        {article.category && (
          <span className="text-xs font-semibold uppercase text-brand-600">{article.category.name}</span>
        )}
        <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug group-hover:text-brand-600">
          {article.title}
        </h3>
        {article.excerpt && <p className="mt-2 line-clamp-2 text-sm text-gray-500">{article.excerpt}</p>}
        <p className="mt-3 text-xs text-gray-400">
          {article.author?.displayName} · {fmtDate(article.publishedAt)}
        </p>
      </div>
    </Link>
  );
}
