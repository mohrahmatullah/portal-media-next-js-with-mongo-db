import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import store from "@/lib/redis";

export type SessionContext = "reader" | "admin";

const COOKIE: Record<SessionContext, string> = {
  reader: "reader_session",
  admin: "admin_session",
};

const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

type SessionData = { userId: string; role: string };

function key(ctx: SessionContext, id: string) {
  return `sess:${ctx}:${id}`;
}

function newToken() {
  return randomBytes(32).toString("hex");
}

export async function createSession(ctx: SessionContext, data: SessionData): Promise<void> {
  const token = newToken();
  await store.set(key(ctx, token), JSON.stringify(data), TTL_SECONDS);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE[ctx], token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function readSession(ctx: SessionContext): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE[ctx])?.value;
  if (!token) return null;
  const raw = await store.get(key(ctx, token));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function destroySession(ctx: SessionContext): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE[ctx])?.value;
  if (token) await store.del(key(ctx, token));
  cookieStore.delete(COOKIE[ctx]);
}

export { COOKIE as SESSION_COOKIES };
