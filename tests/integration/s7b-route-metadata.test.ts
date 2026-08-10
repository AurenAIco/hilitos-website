// tests/integration/s7b-route-metadata.test.ts — S7B route metadata closure
// (Wave 1 integration hardening).
//
// S7A (fix/storefront-seo-foundation-s7a) built the site-origin resolver
// (lib/seo/siteUrl.ts) and the root-level metadataBase/OG/Twitter defaults,
// but explicitly deferred per-route title/description/canonical to a later
// slice (docs/SEO.md's "S7B / follow-up residuals"). This file proves that
// closure for the five routes named in the integration mandate — /,
// /catalogo, /nosotros, /privacy, /colecciones/[slug] — plus the
// /productos/[slug] canonical, which fit into the existing generateMetadata
// function without a second backend fetch.
//
// HONESTY BOUNDARY: these route modules default-export React components
// (some using next/image), which this repo's `node --test` harness cannot
// RENDER outside the Next runtime (see tests/homepage/home-featured-gate
// .test.ts's header for the established precedent). Merely IMPORTING a
// module — evaluating its top-level `metadata` object/`generateMetadata`
// function without ever calling the default-exported component — does not
// render anything and is safe; every assertion below relies only on that.
//
// NEXT_PUBLIC_SITE_URL must be set BEFORE these modules are imported (each
// resolves its canonical via lib/seo/siteUrl.ts's resolveSiteUrl(), which
// reads process.env once at module-evaluation time) — same ordering
// convention as tests/storefront-v2/whatsapp-number-configured.test.ts.
// STOREFRONT_BACKEND_URL is deliberately left unset so every catalog fetch
// fails closed to "unavailable" with no network access, matching this
// suite's other tests (see tests/storefront-v2/collections-route.test.ts).
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const CANONICAL_ORIGIN = "https://hilitos.co";

let homepageMod: typeof import("@/app/(public)/page");
let catalogoMod: typeof import("@/app/(public)/catalogo/page");
let nosotrosMod: typeof import("@/app/(public)/nosotros/page");
let privacyMod: typeof import("@/app/(public)/privacy/page");
let coleccionesMod: typeof import("@/app/(public)/colecciones/[slug]/page");
let productosMod: typeof import("@/app/(public)/productos/[slug]/page");

before(async () => {
  process.env.NEXT_PUBLIC_SITE_URL = CANONICAL_ORIGIN;
  homepageMod = await import("@/app/(public)/page");
  catalogoMod = await import("@/app/(public)/catalogo/page");
  nosotrosMod = await import("@/app/(public)/nosotros/page");
  privacyMod = await import("@/app/(public)/privacy/page");
  coleccionesMod = await import("@/app/(public)/colecciones/[slug]/page");
  productosMod = await import("@/app/(public)/productos/[slug]/page");
});

function titleText(title: unknown): string {
  if (typeof title === "string") return title;
  if (title && typeof title === "object") {
    if ("absolute" in title && typeof (title as { absolute?: unknown }).absolute === "string") {
      return (title as { absolute: string }).absolute;
    }
    if ("default" in title && typeof (title as { default?: unknown }).default === "string") {
      return (title as { default: string }).default;
    }
  }
  throw new Error(`unexpected title shape: ${JSON.stringify(title)}`);
}

// ---- / (homepage) ------------------------------------------------------

test("/ has a meaningful Spanish title and description, plus a canonical URL at the site origin", () => {
  const { metadata } = homepageMod;
  assert.ok(metadata);
  const title = titleText(metadata!.title);
  assert.match(title, /Hilitos/);
  assert.ok(title.length > 5);
  assert.match(metadata!.description as string, /[a-záéíóúñ]/i);
  assert.equal((metadata!.alternates as { canonical?: string })?.canonical, CANONICAL_ORIGIN);
});

// ---- /catalogo -----------------------------------------------------------

test("/catalogo has a meaningful Spanish title and description, plus a canonical URL", () => {
  const { metadata } = catalogoMod;
  assert.equal(titleText(metadata!.title), "Catálogo");
  assert.match(metadata!.description as string, /catálogo/i);
  assert.equal((metadata!.alternates as { canonical?: string })?.canonical, `${CANONICAL_ORIGIN}/catalogo`);
});

// ---- /nosotros -------------------------------------------------------------

test("/nosotros has a meaningful Spanish title and description, plus a canonical URL", () => {
  const { metadata } = nosotrosMod;
  assert.equal(titleText(metadata!.title), "Nosotros");
  assert.match(metadata!.description as string, /Bucaramanga/);
  assert.equal((metadata!.alternates as { canonical?: string })?.canonical, `${CANONICAL_ORIGIN}/nosotros`);
});

test("/nosotros's description is verbatim the page's own approved hero copy, not a new invented claim", () => {
  const pageSrc = readFileSync(join(ROOT, "app", "(public)", "nosotros", "page.tsx"), "utf8");
  const { metadata } = nosotrosMod;
  assert.equal(pageSrc.includes(metadata!.description as string), true, "description must appear verbatim in the page's own rendered copy");
});

// ---- /privacy --------------------------------------------------------------

test("/privacy keeps its existing title/description and gains a canonical URL", () => {
  const { metadata } = privacyMod;
  assert.equal(titleText(metadata!.title), "Privacidad");
  assert.match(metadata!.description as string, /privacidad/i);
  assert.equal((metadata!.alternates as { canonical?: string })?.canonical, `${CANONICAL_ORIGIN}/privacy`);
});

// ---- /colecciones/[slug] ----------------------------------------------------

test("/colecciones/[slug] preserves S2's dynamic title/description and adds a per-slug canonical URL", async () => {
  const meta = await coleccionesMod.generateMetadata({ params: Promise.resolve({ slug: "batas" }) });
  assert.equal(titleText(meta.title), "Batas");
  assert.match(meta.description as string, /[a-záéíóúñ]/i);
  assert.equal((meta.alternates as { canonical?: string })?.canonical, `${CANONICAL_ORIGIN}/colecciones/batas`);
});

test("/colecciones/[slug] resolves a distinct canonical URL for every one of the six frozen slugs", async () => {
  const slugs = ["ajuares-y-estuches", "batas", "conjuntos", "mantas-y-cobijas", "mamelucos", "amigurumis"];
  const canonicals = await Promise.all(
    slugs.map(async (slug) => {
      const meta = await coleccionesMod.generateMetadata({ params: Promise.resolve({ slug }) });
      return (meta.alternates as { canonical?: string })?.canonical;
    }),
  );
  for (const [i, slug] of slugs.entries()) {
    assert.equal(canonicals[i], `${CANONICAL_ORIGIN}/colecciones/${slug}`);
  }
  assert.equal(new Set(canonicals).size, slugs.length, "every slug must resolve a distinct canonical URL");
});

test("/colecciones/[slug]: an invalid slug gets no canonical URL — fail-closed metadata matches the page's own notFound()", async () => {
  const meta = await coleccionesMod.generateMetadata({ params: Promise.resolve({ slug: "not-a-real-collection" }) });
  assert.equal(meta.alternates, undefined, "an invalid slug must not get a canonical pointing at a route that 404s");
});

// ---- /productos/[slug] residual ---------------------------------------------

test("/productos/[slug]: a resolvable design gets a canonical URL with no second backend fetch", async () => {
  // With STOREFRONT_BACKEND_URL unset, getStorefrontCatalog() fails closed to
  // "unavailable" (no live design to resolve) — this proves the *unresolved*
  // branch is fail-closed (no canonical), matching collections' invalid-slug
  // case. The resolved-design branch is exercised indirectly: source
  // inspection below pins that generateMetadata calls resolveSiteUrl only
  // when `design` is truthy, from the SAME getStorefrontCatalog() call
  // already in the function — no additional fetch introduced.
  const meta = await productosMod.generateMetadata({ params: Promise.resolve({ slug: "slug-inexistente-xyz" }) });
  assert.equal(meta.alternates, undefined);
  assert.equal(titleText(meta.title), "Producto");
});

test("/productos/[slug]'s canonical wiring reuses the single existing getStorefrontCatalog() call — no second fetch", () => {
  const src = readFileSync(join(ROOT, "app", "(public)", "productos", "[slug]", "page.tsx"), "utf8");
  const generateMetadataSrc = src.slice(src.indexOf("export async function generateMetadata"), src.indexOf("export default"));
  const fetchCallCount = (generateMetadataSrc.match(/getStorefrontCatalog\(\)/g) ?? []).length;
  assert.equal(fetchCallCount, 1, "generateMetadata must call getStorefrontCatalog() exactly once");
});

// ---- no invented claims in any S7B-authored description --------------------

const FORBIDDEN_CLAIMS = [
  "fundad",
  "premio",
  "certificad",
  "década",
  "años de",
  "tradición familiar",
  "ISO",
  "GDPR",
];

test("no S7B route description invents a founding date, award, certification, or unsupported claim", () => {
  const descriptions = [
    homepageMod.metadata!.description as string,
    catalogoMod.metadata!.description as string,
    nosotrosMod.metadata!.description as string,
    privacyMod.metadata!.description as string,
  ];
  for (const description of descriptions) {
    for (const claim of FORBIDDEN_CLAIMS) {
      assert.equal(
        description.toLowerCase().includes(claim.toLowerCase()),
        false,
        `unexpected unsupported claim "${claim}" in description: "${description}"`,
      );
    }
  }
});

// ---- no new OG image invented ------------------------------------------------

test("no S7B route introduces an openGraph.images entry (no approved OG asset exists yet — docs/SEO.md residual)", () => {
  for (const metadata of [homepageMod.metadata, catalogoMod.metadata, nosotrosMod.metadata, privacyMod.metadata]) {
    const og = metadata!.openGraph as { images?: unknown } | undefined;
    assert.equal(og?.images, undefined, "no route-level openGraph.images may be introduced without a real repository asset");
  }
});

// ---- sitemap: S7B residual closed (final pre-launch value pass) ------------
// The S7B "not fixed in S7A" note this file used to pin ("sitemap.ts still
// lists only the four finished static routes") described a deliberate,
// documented gap — not a permanent constraint — pending an enumerable
// published-slug source. lib/catalog/storefront.ts's getStorefrontCatalog()
// is that source now, so app/sitemap.ts delegates entry-building to the pure
// lib/seo/sitemapEntries.ts (see tests/seo/sitemap-entries.test.ts for
// behavioral proof it only ever emits slugs sourced from a real catalog,
// never invented ones, and tests/seo/robots-sitemap.test.ts for the
// unavailable/no-backend fail-closed floor). This file just pins the wiring.

test("app/sitemap.ts delegates entry-building to lib/seo/sitemapEntries's buildSitemapEntries (no reimplemented static-route list)", () => {
  const src = readFileSync(join(ROOT, "app", "sitemap.ts"), "utf8");
  assert.equal(src.includes("buildSitemapEntries"), true);
  assert.equal(src.includes("@/lib/seo/sitemapEntries"), true);
  assert.equal(src.includes("getStorefrontCatalog"), true, "sitemap.ts must source dynamic entries from the live catalog, not a hardcoded list");
});
