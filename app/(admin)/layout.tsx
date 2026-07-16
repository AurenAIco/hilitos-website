// app/(admin)/layout.tsx — STRUCTURAL BOUNDARY ONLY (SHELL0).
// Future owner: ADM1a/ADM1b (admin auth, chrome, metadata — NONE of it here).
//
// This layout exists solely to reserve the (admin) route group as a stable
// seam that does NOT inherit the public storefront shell: SkipLink/Header/
// Footer and styles/amarillo.css live exclusively in app/(public)/layout.tsx,
// and sibling route groups do not share layouts, so any future (admin) route
// composes root → (admin) only.
//
// MUST stay free of: <html>/<body> (root owns them — a second pair would
// create a forbidden multiple-root-layout topology), storefront chrome or
// CSS, auth, Supabase, middleware, server actions, admin UI, and any
// page.tsx under this group (a layout with no page produces NO route).
//
// ADM1a carry-forward note: admin does NOT inherit :focus-visible or the
// reduced-motion reset from amarillo.css (storefront-owned). ADM1a must
// establish its own admin accessibility foundation or propose a separately
// reviewed shared a11y-base extraction. Do not solve that here.
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
