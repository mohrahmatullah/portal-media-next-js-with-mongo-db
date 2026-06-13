import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  await destroySession("reader");
  return NextResponse.redirect(new URL("/", req.url));
}
