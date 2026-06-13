import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedStaticPage } from "@/lib/queries";
import { getSiteSeo } from "@/lib/seo";
import { recordVisit } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPublishedStaticPage(slug).catch(() => null);
  const site = await getSiteSeo();
  if (!page) return { title: "Tidak ditemukan" };
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || site.defaultDescription,
    openGraph: { images: page.ogImage ? [page.ogImage] : undefined },
  };
}

export default async function StaticPageView({ params }: { params: Promise<{ slug: string }> }) {
  recordVisit("static");
  const { slug } = await params;
  const page = await getPublishedStaticPage(slug).catch(() => null);
  if (!page) notFound();

  return (
    <article className="container max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold md:text-4xl">{page.title}</h1>
      <div className="prose-content mt-6" dangerouslySetInnerHTML={{ __html: page.body }} />
    </article>
  );
}
