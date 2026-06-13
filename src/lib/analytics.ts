import store from "@/lib/redis";
import prisma from "@/lib/prisma";

const VISIT_KEY_PREFIX = "visits:"; // visits:<YYYY-MM-DD>:<pageType>

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Record a visit without blocking the request. Increments a fast Redis counter;
 * the counter is later flushed into VisitAggregate for historical reporting.
 */
export async function recordVisit(pageType = "page"): Promise<void> {
  try {
    await store.incr(`${VISIT_KEY_PREFIX}${today()}:${pageType}`);
  } catch {
    /* best-effort; never block rendering */
  }
}

/**
 * Flush today's (and any pending) Redis visit counters into the durable
 * VisitAggregate collection. Safe to call repeatedly (upsert by date+pageType).
 */
export async function flushVisits(): Promise<number> {
  const keys = await store.keys(`${VISIT_KEY_PREFIX}*`);
  let flushed = 0;
  for (const key of keys) {
    const raw = await store.get(key);
    const count = parseInt(raw ?? "0", 10);
    if (!count) continue;
    const [, date, pageType] = key.split(":");
    if (!date) continue;
    await prisma.visitAggregate.upsert({
      where: { date_pageType: { date, pageType: pageType ?? "page" } },
      create: { date, pageType: pageType ?? "page", count },
      update: { count },
    });
    flushed += 1;
  }
  return flushed;
}

/** Live count for a date, reading the Redis counter if present. */
export async function liveVisitCount(date = today(), pageType = "page"): Promise<number> {
  const raw = await store.get(`${VISIT_KEY_PREFIX}${date}:${pageType}`);
  return parseInt(raw ?? "0", 10);
}
