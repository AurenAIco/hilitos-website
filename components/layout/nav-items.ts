// components/layout/nav-items.ts — AMARILLO. Single source for public nav.
// Links point to PLANNED routes only (skeletons today; Verde/Amarillo later).
// NOTE (handoff): the final "Colecciones" landing target is an open editorial
// decision — it currently points at the planned /colecciones/[slug] route
// using the fixture's "esenciales" slug.
export const NAV_ITEMS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/colecciones/esenciales", label: "Colecciones" },
  { href: "/nosotros", label: "Nosotros" },
] as const;
