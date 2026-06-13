import store from "@/lib/redis";

/**
 * Best-effort JSON cache over the Redis store wrapper. Cache misses (and a
 * down Redis) simply call through to the loader.
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const hit = await store.get(key);
  if (hit) {
    try {
      return JSON.parse(hit) as T;
    } catch {
      /* fall through to reload */
    }
  }
  const value = await loader();
  await store.set(key, JSON.stringify(value), ttlSeconds);
  return value;
}

export const CACHE_PREFIX = {
  home: "cache:home",
  article: "cache:article:",
  category: "cache:category:",
};

/** Invalidate the public read caches affected by content mutations. */
export async function invalidateContentCaches(): Promise<void> {
  await store.del(CACHE_PREFIX.home);
  await store.delByPrefix(CACHE_PREFIX.article);
  await store.delByPrefix(CACHE_PREFIX.category);
}
