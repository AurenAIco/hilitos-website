// app/(admin)/layout.tsx — SERVER-SIDE PROTECTION BOUNDARY (ADM1a-S1).
// Owner: ADM1a (HILITOS-ADM1A-SECURITY-FOUNDATION, Gate G1). Supersedes the
// inert SHELL0 passthrough (docs/OWNERSHIP.md).
//
// S1 scope only: force-dynamic + non-indexable metadata + the admin a11y
// foundation (§18) + a semantic root landmark. NO session guard yet — the
// server-verified auth check (INV-1/INV-3) arrives with lib/admin/** in
// Slice S3, once Slice S2 has introduced middleware.ts and the login/shell
// page skeleton. Until then this remains children-passthrough with no
// page.tsx anywhere under (admin), so the route manifest still contains no
// /admin route (INV-16, INV-20).
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
  // Semantic root landmark only — no nav/header chrome yet (that arrives
  // with the S2 login/shell page skeleton). #admin-contenido is the future
  // admin skip-link target (RD-7); it is never the public #contenido id.
  return <div id="admin-contenido">{children}</div>;
}
