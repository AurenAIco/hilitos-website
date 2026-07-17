// lib/admin/routing.ts — ADM1a-S2 pure routing-decision helper.
// Owner: ADM1a (HILITOS-ADM1A-SECURITY-FOUNDATION, Gate G1, Slice S2).
//
// No imports, no next/server dependency, no I/O — fully unit-testable in
// isolation. middleware.ts is a thin adapter that calls decideAdminRouting()
// and maps its result onto NextResponse; all routing logic lives here.
//
// Cookie presence is not authentication or authorization. This module makes
// a coarse routing-UX decision only; server-side session verification
// arrives in Slice S3 (INV-1/INV-3). Nothing here evaluates identity, role,
// or permissions, and nothing here is a security boundary.

// PLACEHOLDER cookie name for coarse presence-based routing UX only. Never
// set by any S2 code path (S2 never sets a cookie, so every ordinary
// request fails closed to /admin/login). NOT compatible-by-design with the
// eventual @supabase/ssr session-cookie contract — Slice S3 owns that
// dependency and either replaces or aligns this name under its own
// INV-23-reviewed change; nothing here anticipates or stubs that work.
export const ADMIN_SESSION_COOKIE = "hilitos_admin_session";

export type AdminRoutingDecision =
  | { action: "next" }
  | { action: "redirect"; location: "/admin/login" };

function pathnameIsWithinAdminScope(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

// Decision table (§5/§18 of the ADM1a-S2 dispatch — implemented exactly,
// no additional inputs, no client-supplied redirect target of any kind):
//   (a) not /admin and not /admin/*  → next       (defensive re-check;
//       the middleware matcher already scopes to /admin/:path*, but this
//       function re-checks so a matcher regression alone could not affect
//       any non-admin route)
//   (b) exactly /admin/login         → next, always (cookie or not) — the
//       carve-out that makes a redirect loop structurally impossible: this
//       function never redirects a request that is already at the target
//   (c) any other /admin* w/o cookie → redirect to the constant "/admin/login"
//   (d) any other /admin* w/ cookie  → next (routing UX only — presence is
//       never validated, decoded, or otherwise treated as authentication)
export function decideAdminRouting(
  pathname: string,
  hasCookie: boolean,
): AdminRoutingDecision {
  if (!pathnameIsWithinAdminScope(pathname)) {
    return { action: "next" };
  }
  if (pathname === "/admin/login") {
    return { action: "next" };
  }
  if (!hasCookie) {
    return { action: "redirect", location: "/admin/login" };
  }
  return { action: "next" };
}
