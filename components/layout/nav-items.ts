// components/layout/nav-items.ts — AMARILLO. Single source for public nav.
// VERDE (Slice S2 — collections live): the "Colecciones" overview item now
// points at /catalogo (the live, catalog-backed all-categories listing) —
// not an arbitrary single category. "esenciales" was never a real category
// (lib/contract.ts's frozen six-slug CategorySlug union has no such value);
// it only worked against the SHELL0 route skeleton, which accepted any
// string. Category-specific links may target the validated
// /colecciones/[slug] routes (see app/(public)/colecciones/[slug]/page.tsx).
export const NAV_ITEMS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo", label: "Colecciones" },
  { href: "/nosotros", label: "Nosotros" },
] as const;
