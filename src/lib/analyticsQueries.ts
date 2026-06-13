import prisma from "@/lib/prisma";
import { liveVisitCount } from "@/lib/analytics";
import type { Role } from "@prisma/client";

function lastNDates(n: number): string[] {
  const out: string[] = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export async function getPostingActivity(days = 30) {
  const dates = lastNDates(days);
  const since = new Date(`${dates[0]}T00:00:00.000Z`);
  const articles = await prisma.article.findMany({
    where: { status: "published", publishedAt: { gte: since } },
    select: { publishedAt: true },
  });
  const counts = new Map<string, number>(dates.map((d) => [d, 0]));
  for (const a of articles) {
    if (!a.publishedAt) continue;
    const key = a.publishedAt.toISOString().slice(0, 10);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return dates.map((date) => ({ date: date.slice(5), count: counts.get(date) ?? 0 }));
}

export async function getUserMetrics() {
  const grouped = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  const byRole = grouped.map((g) => ({ role: g.role as Role, count: g._count._all }));
  const total = byRole.reduce((sum, r) => sum + r.count, 0);
  const readers = byRole.find((r) => r.role === "user")?.count ?? 0;
  return { total, readers, byRole };
}

export async function getVisitorSeries(days = 14) {
  const dates = lastNDates(days);
  const rows = await prisma.visitAggregate.findMany({
    where: { date: { in: dates } },
  });
  const sums = new Map<string, number>(dates.map((d) => [d, 0]));
  for (const r of rows) sums.set(r.date, (sums.get(r.date) ?? 0) + r.count);

  // Fold in today's live (not-yet-flushed) counters across page types.
  const today = dates[dates.length - 1];
  for (const t of ["home", "article", "category", "static", "page"]) {
    sums.set(today, (sums.get(today) ?? 0) + (await liveVisitCount(today, t)));
  }
  return dates.map((date) => ({ date: date.slice(5), visits: sums.get(date) ?? 0 }));
}

export async function getArticleVolume() {
  const [byStatus, categories] = await Promise.all([
    prisma.article.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.category.findMany({ include: { _count: { select: { articles: true } } } }),
  ]);
  return {
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    byCategory: categories.map((c) => ({ category: c.name, count: c._count.articles })),
  };
}

export async function getDashboardAnalytics() {
  const [posting, users, visitors, volume] = await Promise.all([
    getPostingActivity(30),
    getUserMetrics(),
    getVisitorSeries(14),
    getArticleVolume(),
  ]);
  return { posting, users, visitors, volume };
}
