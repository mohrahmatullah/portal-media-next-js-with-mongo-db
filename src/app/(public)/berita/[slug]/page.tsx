import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getArticleBySlug, getArticleComments } from "@/lib/queries";
import { getCurrentReader } from "@/lib/auth/context";
import { getSiteSeo } from "@/lib/seo";
import { recordVisit } from "@/lib/analytics";
import VideoPlayer from "@/components/public/VideoPlayer";
import Gallery from "@/components/public/Gallery";
import CommentSection from "@/components/public/CommentSection";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  const site = await getSiteSeo();
  if (!article) return { title: "Tidak ditemukan" };

  const title = article.seo?.metaTitle || article.title;
  const description = article.seo?.metaDescription || article.excerpt || site.defaultDescription;
  const ogImage = article.seo?.ogImage || article.coverImage || site.defaultOgImage || undefined;

  return {
    title,
    description,
    alternates: article.seo?.canonicalUrl ? { canonical: article.seo.canonicalUrl } : undefined,
    openGraph: {
      title,
      description,
      type: "article",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function fmtDate(d?: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  recordVisit("article");
  const { slug } = await params;
  const article = await getArticleBySlug(slug).catch(() => null);
  if (!article) notFound();

  const [comments, readerUser] = await Promise.all([
    getArticleComments(article.id),
    getCurrentReader(),
  ]);
  const reader = readerUser ? { displayName: readerUser.displayName } : null;

  return (
    <article className="container max-w-3xl py-8">
      {article.category && (
        <Link
          href={`/kategori/${article.category.slug}`}
          className="text-sm font-semibold uppercase text-brand-600 hover:underline"
        >
          {article.category.name}
        </Link>
      )}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{article.title}</h1>

      {/* Author byline with photo */}
      <div className="mt-4 flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-brand-100">
          {article.author?.photoUrl ? (
            <Image
              src={article.author.photoUrl}
              alt={article.author.displayName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm font-semibold text-brand-700">
              {article.author?.displayName.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-sm">
          <p className="font-medium">{article.author?.displayName}</p>
          <p className="text-gray-400">{fmtDate(article.publishedAt)}</p>
        </div>
      </div>

      {article.coverImage && (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      {/* Optional video (rendered only when present) */}
      <VideoPlayer video={article.video} />

      {article.excerpt && (
        <p className="mt-6 text-lg font-medium text-gray-600">{article.excerpt}</p>
      )}

      <div
        className="prose-content mt-6"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      <Gallery images={article.relatedImages} />

      <CommentSection
        articleId={article.id}
        slug={article.slug}
        comments={comments}
        reader={reader}
      />
    </article>
  );
}
