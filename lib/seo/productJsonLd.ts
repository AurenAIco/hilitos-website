// lib/seo/productJsonLd.ts — Product structured data for /productos/[slug]
// (Slice F, final pre-launch value pass: "Product structured data if
// accurate fields already exist"). Pure projection from an already-resolved
// StorefrontDesign + canonical URL into a schema.org Product/AggregateOffer
// object — every field is sourced from the live catalog contract
// (lib/contract.ts), never invented (no rating, no review count, no brand
// claim beyond the name already shown on the page).
import type { StorefrontDesign } from "@/lib/contract";

export interface ProductJsonLd {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  sku: string;
  image: string;
  description?: string;
  offers: {
    "@type": "AggregateOffer";
    priceCurrency: "COP";
    lowPrice: number;
    highPrice: number;
    offerCount: number;
    availability: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
    url: string;
  };
}

/**
 * TRUTH CONTRACT (cleanup pass audit):
 *  - lowPrice/highPrice are computed HERE, directly from design.variants —
 *    never trusted from a separately-derived field (e.g. design.priceFrom)
 *    — so this stays correct even if that field and the variants array
 *    were ever to disagree upstream. The V2 contract (lib/contract.ts)
 *    guarantees variants.length >= 1 and every emitted variant.price is a
 *    real, validated COP integer > 0 (invalid-price variants are excluded
 *    before emission) — nothing here is invented.
 *  - When every variant shares one price, lowPrice === highPrice, which is
 *    the correct AggregateOffer representation of a uniform price — never
 *    a bare singular `price` field standing in for a range.
 *  - availability is "InStock" iff design.availability === "available",
 *    which the contract defines as "NOT every emitted variant is
 *    sold_out" — i.e. at least one real, purchasable variant exists. It is
 *    "OutOfStock" whenever every variant is sold_out. Never fabricated,
 *    never an inventory count.
 *  - offerCount is the count of real, emitted (contract-valid) variants —
 *    every one is a genuine distinct SKU, whether currently sold_out or
 *    not; sold-out variants are still real offers, just unavailable ones.
 *  - No rating, review, brand, GTIN, or inventory-quantity field is ever
 *    emitted: none of that data exists in the catalog contract, and
 *    inventing any of it would violate the mission's no-fabrication rule.
 */
export function buildProductJsonLd(design: StorefrontDesign, imageUrl: string, canonicalUrl: string): ProductJsonLd {
  const prices = design.variants.map((variant) => variant.price);
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: design.name,
    sku: design.designRef,
    image: imageUrl,
    description: design.description || undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "COP",
      lowPrice,
      highPrice,
      offerCount: design.variants.length,
      availability: design.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
  };
}

/** JSON.stringify, hardened for embedding inside a `<script>` tag: escapes
 * "<" so a value containing the literal substring "</script" can never
 * terminate the script element early. Standard mitigation for
 * dangerouslySetInnerHTML'd JSON-LD. */
export function safeJsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
