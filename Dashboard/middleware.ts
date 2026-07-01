import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on all paths except static assets, images, and the embedded module
  // HTML files served from /modules (they are guarded by their page wrapper).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|modules/.*\\.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
