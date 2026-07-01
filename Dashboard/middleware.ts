import { NextResponse, type NextRequest } from "next/server";

// Routes reachable without authentication.
const PUBLIC_PATHS = ["/login", "/unauthorized"];

/**
 * Lightweight, Edge-safe auth gate.
 *
 * Next 14 middleware runs in the Edge runtime, which cannot bundle
 * @supabase/supabase-js (it references Node-only APIs like `process.version`).
 * So we deliberately keep Supabase OUT of the edge bundle and only do a cheap
 * cookie-presence check here to redirect obvious cases. The authoritative auth
 * and role checks happen server-side in requireUser()/requireAdmin(), which run
 * in every protected layout (app/(app)/layout.tsx and app/admin/layout.tsx) and
 * revalidate the token against Supabase. This is defense-in-depth, not a
 * downgrade — an expired/forged cookie is still rejected by the server guards.
 */
function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const authed = hasSupabaseSession(request);

  // Unauthenticated users -> login page.
  if (!authed && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // Authenticated users hitting the login page -> their home. (Admins are sent
  // to /admin by the login action; a manual visit lands on /dashboard, which
  // admins may also view.)
  if (authed && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets, images, and the embedded module
  // HTML files served from /modules.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|modules/.*\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
