// middleware.ts — ADM1a-S2 fail-closed admin route boundary. SHARED file
// (ADM0 §21) — created under Violeta's shared-file approval, per the
// HILITOS-ADM1A-S2 dispatch (§5 MIDDLEWARE_CONTRACT) and Mission Pack
// §19 S2 / §24.1 OD-3.
//
// Cookie presence is not authentication or authorization. This file is a
// thin adapter only: all routing logic lives in the dependency-free pure
// function lib/admin/routing.ts. Server-side session verification arrives
// in Slice S3 (INV-1/INV-3) — nothing here evaluates identity, role, or
// permissions, and nothing here is a security boundary.
//
// Matcher is EXACTLY /admin/:path* — never broadened, no negative
// lookahead. This file must never: import any Supabase package; construct
// a Supabase client; add or use @supabase/ssr (that dependency is Slice
// S3's, under INV-23); make any network request; validate a JWT or token;
// decode a session; query a database; evaluate identity, role, or
// permissions; make an authorization decision; contain business, catalog,
// customer, company, or operational logic of any kind; access environment
// secrets (no process.env reads); set a cookie; consume any client-supplied
// redirect input; or log request values. Any Supabase import, dependency
// addition, client construction, or network call anywhere in this slice's
// diff is a STOP condition (pack §23), never a reviewable exception.
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, decideAdminRouting } from "@/lib/admin/routing";

export const config = { matcher: ["/admin/:path*"] };

export function middleware(request: NextRequest) {
  const hasCookie = request.cookies.has(ADMIN_SESSION_COOKIE);
  const decision = decideAdminRouting(request.nextUrl.pathname, hasCookie);

  if (decision.action === "next") {
    return NextResponse.next();
  }

  // Redirect target is always the constant "/admin/login" — no query
  // string is ever attached or propagated, and no client-supplied
  // next/redirect/returnTo/return_path value is ever read (INV-22
  // implementation and its negative-test suite remain Slice S3's).
  const url = request.nextUrl.clone();
  url.pathname = decision.location;
  url.search = "";
  return NextResponse.redirect(url);
}
