// tests/seo/product-metadata.test.ts — behavioral proof for
// /productos/[slug]'s generateMetadata (Fixes 5 & 6, final pre-launch QA
// delta): product-specific meta description, and product-specific
// OpenGraph/Twitter sharing metadata for WhatsApp/social link previews.
//
// Drives the REAL generateMetadata against a real getStorefrontCatalog()
// fetch, stubbed at the network boundary only — same technique as
// tests/homepage/home-featured-gate.test.ts and
// tests/seo/sitemap-live-gate.test.ts. STOREFRONT_BACKEND_URL must be set
// BEFORE lib/catalog/storefront.ts is imported (module-level constant);
// generateMetadata itself is imported dynamically for the same reason.
import test, { before } from "node:test";
import assert from "node:assert/strict";
import type { StorefrontCatalogV2 } from "@/lib/contract";

let generateMetadata: typeof import("@/app/(public)/productos/[slug]/page").generateMetadata;

const PUBLISHED_DESIGN_REF = "4194";
const PUBLISHED_DESCRIPTION = "Ajuar tejido a mano en fibra beige, con gorro y escarpines a juego.";
const CATALOG: StorefrontCatalogV2 = {
  schemaVersion: 2,
  categories: [{ slug: "ajuares-y-estuches", name: "Ajuares y estuches" }],
  designs: [
    {
      designRef: PUBLISHED_DESIGN_REF,
      slug: "design-4194",
      name: "Ajuar Tejido Beige",
      description: PUBLISHED_DESCRIPTION,
      category: "ajuares-y-estuches",
      primaryImage: { url: "/storage/v1/object/public/product-images/products/x/4194.jpg", alt: "Ajuar tejido beige sobre manta clara" },
      availability: "available",
      priceFrom: 89900,
      colors: [{ name: "Beige" }],
      sizes: ["RN"],
      featuredRank: null,
      variants: [
        {
          ref: "4194-BEIGE-RN",
          color: { name: "Beige" },
          size: "RN",
          price: 89900,
          image: { url: "/storage/v1/object/public/product-images/products/x/4194.jpg" },
          availability: "available",
        },
      ],
    },
    {
      // Real, published design with NO description ("" per the contract,
      // never null) — must fall back to the generic site description, not
      // an empty string and not an invented one.
      designRef: "2814",
      slug: "design-2814",
      name: "Bata Tejida Rosada",
      description: "",
      category: "ajuares-y-estuches",
      primaryImage: { url: "/storage/v1/object/public/product-images/products/x/2814.jpg" },
      availability: "available",
      priceFrom: 62900,
      colors: [{ name: "Rosado" }],
      sizes: ["RN"],
      featuredRank: null,
      variants: [
        {
          ref: "2814-ROSADO-RN",
          color: { name: "Rosado" },
          size: "RN",
          price: 62900,
          image: { url: "/storage/v1/object/public/product-images/products/x/2814.jpg" },
          availability: "available",
        },
      ],
    },
  ],
};

before(async () => {
  process.env.STOREFRONT_BACKEND_URL = "https://backend.invalid";
  process.env.STOREFRONT_IMAGE_HOST = "img.hilitos.co";
  process.env.NEXT_PUBLIC_SITE_URL = "https://hilitos.co";
  globalThis.fetch = (async () =>
    new Response(JSON.stringify(CATALOG), { status: 200, headers: { "content-type": "application/json" } })) as typeof globalThis.fetch;

  ({ generateMetadata } = await import("@/app/(public)/productos/[slug]/page"));
});

function ogImageUrl(meta: Awaited<ReturnType<typeof generateMetadata>>): string {
  const images = meta.openGraph?.images;
  const first = Array.isArray(images) ? images[0] : images;
  const url = typeof first === "object" && first !== null && "url" in first ? first.url : first;
  return String(url);
}

// ── Fix 5: product-specific description ─────────────────────────────────────

test("a published design with a real description uses it verbatim as the meta description — not the generic site copy", async () => {
  const meta = await generateMetadata({ params: Promise.resolve({ slug: "design-4194" }) });
  assert.equal(meta.description, PUBLISHED_DESCRIPTION);
  assert.notEqual(meta.description, "Catálogo en línea de Hilitos.");
});

test("a published design with NO description ('' per the contract) falls back to the generic site description — never an empty string", async () => {
  const meta = await generateMetadata({ params: Promise.resolve({ slug: "design-2814" }) });
  assert.equal(meta.description, "Catálogo en línea de Hilitos.");
  assert.notEqual(meta.description, "");
});

test("an unresolvable slug fabricates no description at all (fail-closed, unchanged from before)", async () => {
  const meta = await generateMetadata({ params: Promise.resolve({ slug: "no-existe" }) });
  assert.equal(meta.title, "Producto");
  assert.equal(meta.description, undefined);
  assert.equal(meta.alternates, undefined);
});

// ── Fix 6: OpenGraph / Twitter sharing metadata ─────────────────────────────

test("a published design emits product-specific OpenGraph title/description/url/siteName, and the real resolved primary image", async () => {
  const meta = await generateMetadata({ params: Promise.resolve({ slug: "design-4194" }) });
  assert.equal(meta.openGraph?.title, "Ajuar Tejido Beige");
  assert.equal(meta.openGraph?.description, PUBLISHED_DESCRIPTION);
  assert.equal(meta.openGraph?.url, "https://hilitos.co/productos/design-4194");
  assert.equal(meta.openGraph?.siteName, "Hilitos");
  assert.equal(ogImageUrl(meta), "https://img.hilitos.co/storage/v1/object/public/product-images/products/x/4194.jpg");
});

test("the OG image URL matches EXACTLY the design's own resolved primaryImage — not a different variant/placeholder", async () => {
  const meta4194 = await generateMetadata({ params: Promise.resolve({ slug: "design-4194" }) });
  const meta2814 = await generateMetadata({ params: Promise.resolve({ slug: "design-2814" }) });
  assert.match(ogImageUrl(meta4194), /4194\.jpg$/);
  assert.match(ogImageUrl(meta2814), /2814\.jpg$/);
  assert.notEqual(ogImageUrl(meta4194), ogImageUrl(meta2814));
});

test("Twitter card is summary_large_image with the same product image for a published design", async () => {
  const meta = await generateMetadata({ params: Promise.resolve({ slug: "design-4194" }) });
  assert.equal((meta.twitter as { card?: string } | undefined)?.card, "summary_large_image");
  const images = meta.twitter && "images" in meta.twitter ? meta.twitter.images : undefined;
  const first = Array.isArray(images) ? images[0] : images;
  assert.equal(String(first), "https://img.hilitos.co/storage/v1/object/public/product-images/products/x/4194.jpg");
});

test("an unresolvable/hidden slug never fabricates OG/Twitter metadata or exposes any image", async () => {
  const meta = await generateMetadata({ params: Promise.resolve({ slug: "not-a-real-or-hidden-design" }) });
  assert.equal(meta.openGraph, undefined);
  assert.equal(meta.twitter, undefined);
});

test("app/(public)/layout.tsx's siteName/locale/type are explicitly repeated (Next's openGraph merge fully replaces, never deep-merges)", async () => {
  const meta = await generateMetadata({ params: Promise.resolve({ slug: "design-4194" }) });
  assert.equal(meta.openGraph?.siteName, "Hilitos");
  assert.equal((meta.openGraph as { locale?: string })?.locale, "es_CO");
  assert.equal((meta.openGraph as { type?: string } | undefined)?.type, "website");
});
