import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge gate for the dashboard. This only checks for the presence of the
 * admin session cookie (the edge runtime can't reach Redis/DB). Full role
 * validation happens server-side in route handlers / server components via
 * `getCurrentDashboardUser` (defense in depth).
 *
 * The reader (`reader_session`) and admin (`admin_session`) cookies are
 * namespaced and never interchangeable, so a reader cookie can't satisfy the
 * dashboard gate and vice versa.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    // Allow the login route itself through.
    if (pathname === "/dashboard/login") return NextResponse.next();

    const hasAdmin = req.cookies.has("admin_session");
    if (!hasAdmin) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
