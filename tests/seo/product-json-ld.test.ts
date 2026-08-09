// tests/seo/product-json-ld.test.ts — behavioral proof for
// lib/seo/productJsonLd.ts (Slice F, final pre-launch value pass).
import test from "node:test";
import assert from "node:assert/strict";
import { buildProductJsonLd, safeJsonLdString } from "@/lib/seo/productJsonLd";
import type { StorefrontDesign } from "@/lib/contract";

const DESIGN: StorefrontDesign = {
  designRef: "4194",
  slug: "design-4194",
  name: "Ajuar Tejido Beige",
  description: "Ajuar tejido a mano en fibra natural.",
  category: "ajuares-y-estuches",
  primaryImage: { url: "/products/4194.jpg" },
  availability: "available",
  priceFrom: 89900,
  colors: [{ name: "Beige" }],
  sizes: ["RN"],
  featuredRank: null,
  variants: [
    { ref: "4194-BEIGE-RN", color: { name: "Beige" }, size: "RN", price: 89900, image: { url: "/products/4194.jpg" }, availability: "available" },
    { ref: "4194-BEIGE-0", color: { name: "Beige" }, size: "0", price: 94900, image: { url: "/products/4194.jpg" }, availability: "sold_out" },
  ],
};

test("buildProductJsonLd() sources every field from the design contract, never invents a rating/review", () => {
  const jsonLd = buildProductJsonLd(DESIGN, "https://img.example.com/4194.jpg", "https://hilitos.co/productos/design-4194");
  assert.equal(jsonLd["@type"], "Product");
  assert.equal(jsonLd.sku, "4194");
  assert.equal(jsonLd.name, "Ajuar Tejido Beige");
  assert.equal(jsonLd.image, "https://img.example.com/4194.jpg");
  assert.equal(jsonLd.offers.lowPrice, 89900);
  assert.equal(jsonLd.offers.highPrice, 94900);
  assert.equal(jsonLd.offers.offerCount, 2);
  assert.equal(jsonLd.offers.availability, "https://schema.org/InStock");
  assert.equal(jsonLd.offers.priceCurrency, "COP");
  assert.equal(jsonLd.offers.url, "https://hilitos.co/productos/design-4194");
  assert.equal("aggregateRating" in jsonLd, false);
  assert.equal("review" in jsonLd, false);
  assert.equal("gtin" in jsonLd, false, "no GTIN — never fabricated");
  assert.equal("brand" in jsonLd, false, "no brand claim invented");
});

test("buildProductJsonLd() reports InStock when at least one variant is available, even with one sold_out among them (never OutOfStock while a real offer is purchasable)", () => {
  // DESIGN itself already mixes one available + one sold_out variant, with
  // availability: "available" (the contract's own "not ALL sold_out" rule)
  // — this test pins that exact truth condition explicitly.
  const jsonLd = buildProductJsonLd(DESIGN, "https://img.example.com/4194.jpg", "https://hilitos.co/productos/design-4194");
  assert.ok(DESIGN.variants.some((v) => v.availability === "sold_out"), "sanity: fixture really does mix availability");
  assert.equal(jsonLd.offers.availability, "https://schema.org/InStock");
});

test("buildProductJsonLd() reports OutOfStock when every emitted variant is sold_out", () => {
  const soldOut: StorefrontDesign = { ...DESIGN, availability: "sold_out" };
  const jsonLd = buildProductJsonLd(soldOut, "https://img.example.com/4194.jpg", "https://hilitos.co/productos/design-4194");
  assert.equal(jsonLd.offers.availability, "https://schema.org/OutOfStock");
});

test("buildProductJsonLd() derives lowPrice/highPrice from the actual variants, ignoring a stale/inconsistent design.priceFrom", () => {
  // Defense-in-depth: even if an upstream bug ever let design.priceFrom
  // drift from the real variant prices, the emitted structured data must
  // still reflect the variants themselves — never a separately-trusted,
  // possibly-wrong derived field.
  const inconsistent: StorefrontDesign = { ...DESIGN, priceFrom: 1 };
  const jsonLd = buildProductJsonLd(inconsistent, "https://img.example.com/4194.jpg", "https://hilitos.co/productos/design-4194");
  assert.equal(jsonLd.offers.lowPrice, 89900, "must be the real minimum variant price, not the bogus priceFrom");
  assert.equal(jsonLd.offers.highPrice, 94900);
});

test("buildProductJsonLd() sets lowPrice === highPrice when every variant shares one uniform price (not a fabricated range)", () => {
  const uniform: StorefrontDesign = {
    ...DESIGN,
    variants: DESIGN.variants.map((v) => ({ ...v, price: 89900 })),
  };
  const jsonLd = buildProductJsonLd(uniform, "https://img.example.com/4194.jpg", "https://hilitos.co/productos/design-4194");
  assert.equal(jsonLd.offers.lowPrice, 89900);
  assert.equal(jsonLd.offers.highPrice, 89900);
});

test("buildProductJsonLd() omits description when the design has none", () => {
  const noDescription: StorefrontDesign = { ...DESIGN, description: "" };
  const jsonLd = buildProductJsonLd(noDescription, "https://img.example.com/4194.jpg", "https://hilitos.co/productos/design-4194");
  assert.equal(jsonLd.description, undefined);
  assert.equal(JSON.stringify(jsonLd).includes('"description"'), false);
});

test("safeJsonLdString() escapes a literal </script> so the embed can never be broken out of", () => {
  const dangerous = { name: 'Ajuar</script><script>alert(1)</script>' };
  const serialized = safeJsonLdString(dangerous);
  // Escaping "<" alone is the standard, sufficient mitigation: an HTML
  // parser only treats "</script" (no ">") as the closing-tag trigger, so
  // once every "<" is replaced, no "</script" prefix can ever appear again.
  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("</script"), false);
  assert.equal(serialized.includes("\\u003c/script>"), true);
});
