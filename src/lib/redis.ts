import Redis from "ioredis";

/**
 * Redis client with graceful degradation.
 *
 * If Redis is unreachable (common in local dev without a running server), all
 * operations fall back to an in-process Map so the app keeps working. This is
 * best-effort: caching simply misses and sessions live only for the process
 * lifetime. Production should always have a real Redis.
 */

type Store = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  delByPrefix(prefix: string): Promise<void>;
  keys(pattern: string): Promise<string[]>;
};

const globalForRedis = globalThis as unknown as {
  __redis?: Redis | null;
  __memStore?: Map<string, { v: string; exp?: number }>;
  __redisTried?: boolean;
};

function memStore() {
  if (!globalForRedis.__memStore) globalForRedis.__memStore = new Map();
  return globalForRedis.__memStore;
}

function getRedis(): Redis | null {
  if (globalForRedis.__redisTried) return globalForRedis.__redis ?? null;
  globalForRedis.__redisTried = true;
  const url = process.env.REDIS_URL;
  if (!url) {
    globalForRedis.__redis = null;
    return null;
  }
  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: false,
      retryStrategy: (times) => (times > 2 ? null : 200),
    });
    client.on("error", () => {
      // Swallow — we degrade to the in-memory store on failure.
    });
    globalForRedis.__redis = client;
    return client;
  } catch {
    globalForRedis.__redis = null;
    return null;
  }
}

function now() {
  return Math.floor(Date.now() / 1000);
}

function memGet(key: string): string | null {
  const m = memStore();
  const entry = m.get(key);
  if (!entry) return null;
  if (entry.exp && entry.exp < now()) {
    m.delete(key);
    return null;
  }
  return entry.v;
}

export const store: Store = {
  async get(key) {
    const r = getRedis();
    if (r) {
      try {
        return await r.get(key);
      } catch {
        /* fall through */
      }
    }
    return memGet(key);
  },
  async set(key, value, ttlSeconds) {
    const r = getRedis();
    if (r) {
      try {
        if (ttlSeconds) await r.set(key, value, "EX", ttlSeconds);
        else await r.set(key, value);
        return;
      } catch {
        /* fall through */
      }
    }
    memStore().set(key, { v: value, exp: ttlSeconds ? now() + ttlSeconds : undefined });
  },
  async del(key) {
    const r = getRedis();
    if (r) {
      try {
        await r.del(key);
        return;
      } catch {
        /* fall through */
      }
    }
    memStore().delete(key);
  },
  async incr(key) {
    const r = getRedis();
    if (r) {
      try {
        return await r.incr(key);
      } catch {
        /* fall through */
      }
    }
    const current = parseInt(memGet(key) ?? "0", 10) + 1;
    memStore().set(key, { v: String(current) });
    return current;
  },
  async keys(pattern) {
    const r = getRedis();
    if (r) {
      try {
        return await r.keys(pattern);
      } catch {
        /* fall through */
      }
    }
    const prefix = pattern.replace(/\*$/, "");
    return Array.from(memStore().keys()).filter((k) => k.startsWith(prefix));
  },
  async delByPrefix(prefix) {
    const r = getRedis();
    if (r) {
      try {
        const found = await r.keys(`${prefix}*`);
        if (found.length) await r.del(...found);
        return;
      } catch {
        /* fall through */
      }
    }
    for (const k of Array.from(memStore().keys())) {
      if (k.startsWith(prefix)) memStore().delete(k);
    }
  },
};

export default store;
