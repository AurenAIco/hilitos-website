// app/(admin)/layout.tsx — PRE-AUTH STRUCTURAL & INDEXING BOUNDARY (ADM1a-S1).
// Owner: ADM1a (HILITOS-ADM1A-SECURITY-FOUNDATION, Gate G1). Supersedes the
// inert SHELL0 passthrough (docs/OWNERSHIP.md).
//
// S1 scope only: force-dynamic + non-indexable metadata (INV-16) + the admin
// a11y foundation (§18, in ./admin.css). NO session guard yet — the
// server-verified auth check (INV-1/INV-3) arrives with lib/admin/** in
// Slice S3, once Slice S2 has introduced middleware.ts and the login/shell
// page skeleton. Until then this remains children-passthrough with no
// page.tsx anywhere under (admin), so the route manifest still contains no
// /admin route (INV-16, INV-20). Calling this a "protection boundary" would
// overstate what S1 ships — there is no auth check here yet, only
// structural hardening and non-indexability.
//
// This layout renders no landmark of its own: a bare passthrough has no
// visible content to mark up, and a <div> is not a semantic landmark. The
// future S2+ page owns <main id="admin-contenido"> (§18, RD-7) once real
// admin content exists — that is never this layout's responsibility.
//
// MUST stay free of: <html>/<body> (root owns them), storefront chrome/CSS
// (styles/amarillo.css is never imported here), auth/Supabase code, and any
// page.tsx (a layout with no page produces NO route).
import type { Metadata } from "next";
import "./admin.css";

// Non-indexable, non-static admin surface (INV-16). force-dynamic ensures no
// admin route is ever statically exported; the robots metadata renders
// `<meta name="robots" content="noindex,nofollow">` in every admin response.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
