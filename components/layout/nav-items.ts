// components/layout/nav-items.ts — AMARILLO. Single source for public nav —
// Header, Footer, and MobileNav all render from this one array, so this is
// the only place a top-level nav item is ever added, renamed, or removed.
//
// Final pre-launch QA delta: removed the separate "Colecciones" item. It
// pointed at the exact same /catalogo destination as "Catálogo" (both were
// set there by Slice S2 — see prior history — since "esenciales" was never
// a real category: lib/contract.ts's frozen six-slug CategorySlug union has
// no such value, and it only worked against the SHELL0 route skeleton,
// which accepted any string). Two identically-destined top-level nav items
// reads as a broken link, not a real second destination — there is no
// top-level /colecciones route, and building one is out of this task's
// scope.
//
// The six real /colecciones/[slug] routes are unaffected by this removal and
// continue to exist, render, and carry their own canonical URLs. Be accurate
// about how they are reached, though: there is currently NO internal link to
// any /colecciones/[slug] route anywhere in app/** or components/** — the
// removed item pointed at /catalogo, so it never reached one either, and
// /catalogo renders its category headings as EditorialHeading text, not
// links. Today those routes are reachable only by direct URL and via
// app/sitemap.ts, which emits an entry for every category holding at least
// one published design. Whether to add category links from /catalogo (or to
// stop listing those routes in the sitemap) is an open pre-launch decision,
// deliberately NOT made here.
// 2026-08 brand refresh (approved by Mónica/Juanpa): final public nav is
// Inicio | Catálogo | Personalizados | Nuestra historia | Contacto.
// "Nuestra historia" keeps the existing /nosotros route (canonical URL
// unchanged); "Contacto" targets the homepage contact section anchor;
// /personalizados is a new frontend-only editorial route. No "Tienda", no
// cart — WhatsApp is the conversion channel.
export const NAV_ITEMS = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/personalizados", label: "Personalizados" },
  { href: "/nosotros", label: "Nuestra historia" },
  { href: "/#contacto", label: "Contacto" },
] as const;
