import prisma from "@/lib/prisma";
import { cached, CACHE_PREFIX } from "@/lib/cache";

const PUBLISHED = { status: "published" as const };

export async function getCategoriesNav() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getHomepage() {
  return cached(CACHE_PREFIX.home, 60, async () => {
    const [headline, featured, latest] = await Promise.all([
      prisma.article.findFirst({
        where: { ...PUBLISHED, isHeadline: true },
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
      }),
      prisma.article.findMany({
        where: { ...PUBLISHED, isFeatured: true },
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
        take: 4,
      }),
      prisma.article.findMany({
        where: PUBLISHED,
        include: { category: true, author: true },
        orderBy: { publishedAt: "desc" },
        take: 9,
      }),
    ]);
    return { headline, featured, latest };
  });
}

export async function getArticleBySlug(slug: string) {
  return prisma.article.findFirst({
    where: { slug, ...PUBLISHED },
    include: { category: true, author: true },
  });
}

export async function getArticleComments(articleId: string) {
  return prisma.comment.findMany({
    where: { articleId, status: "visible" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCategoryWithArticles(slug: string, page = 1, perPage = 9) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return null;
  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where: { ...PUBLISHED, categoryId: category.id },
      include: { category: true, author: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.article.count({ where: { ...PUBLISHED, categoryId: category.id } }),
  ]);
  return { category, articles, total, page, perPage };
}

export async function searchArticles(q: string) {
  if (!q.trim()) return [];
  return prisma.article.findMany({
    where: {
      ...PUBLISHED,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { body: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
      ],
    },
    include: { category: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });
}

export async function getPublishedStaticPage(slug: string) {
  return prisma.staticPage.findFirst({ where: { slug, published: true } });
}
