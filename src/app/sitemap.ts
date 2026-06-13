import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const seo = await getSiteSeo();
  if (!seo.indexingEnabled) return [{ url: base, lastModified: new Date() }];

  try {
    const [articles, categories, pages] = await Promise.all([
      prisma.article.findMany({
        where: { status: "published" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({ select: { slug: true } }),
      prisma.staticPage.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    ]);

    return [
      { url: base, lastModified: new Date(), priority: 1 },
      ...categories.map((c) => ({ url: `${base}/kategori/${c.slug}`, changeFrequency: "daily" as const })),
      ...articles.map((a) => ({
        url: `${base}/berita/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: "weekly" as const,
      })),
      ...pages.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt })),
    ];
  } catch {
    return [{ url: base, lastModified: new Date() }];
  }
}
