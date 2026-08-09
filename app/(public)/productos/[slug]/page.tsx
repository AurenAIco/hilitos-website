// app/(public)/productos/[slug]/page.tsx — VERDE (Gate G5: storefront
// catalog connect). Replaces the SHELL0 route skeleton. Server Component:
// fetches the live StorefrontCatalogV2 with ISR, resolves one design by its
// slug, and renders the color/talla VariantSelector. There is no dedicated
// single-design backend endpoint (see app/routers/storefront.py) — the
// grouped catalog is fetched once and the design is looked up in-memory,
// same as the catalog listing page.
//
// "unavailable" (fetch failed, no last-good) is distinct from "not found"
// (fetch succeeded but this slug doesn't exist) — the former shows an honest
// service-unavailable message; the latter is a real Next.js notFound().
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildStorefrontImageUrl, getDesignBySlug, getRelatedDesigns, getStorefrontCatalog } from "@/lib/catalog/storefront";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CatalogStatusBanner } from "@/components/catalog/CatalogStatusBanner";
import { VariantSelector, type ResolvedVariantImageUrls } from "@/components/product/VariantSelector";
import { RelatedDesigns } from "@/components/product/RelatedDesigns";
import { ViewTracker } from "@/components/analytics/ViewTracker";
import { buildProductJsonLd, safeJsonLdString } from "@/lib/seo/productJsonLd";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// See app/(public)/catalogo/page.tsx's identical note: this must be a static
// literal, kept in sync with lib/catalog/storefront.ts's
// CATALOG_REVALIDATE_SECONDS by convention.
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

// Reused verbatim from app/(public)/layout.tsx's own default `description` —
// not a new claim, the same generic site copy every route already falls
// back to when it has nothing more specific. Kept as a local literal
// (rather than importing from that Violeta-owned shared layout file) so
// this Verde-owned route's metadata fallback never depends on that file's
// internal export shape.
const SITE_DESCRIPTION_FALLBACK = "Catálogo en línea de Hilitos.";

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStorefrontCatalog();
  const design = result.catalog ? getDesignBySlug(result.catalog, slug) : undefined;
  // No canonical/OG/description when the design can't be resolved
  // (unavailable catalog or unknown slug) — the page below either shows the
  // honest "unavailable" state or calls notFound() for this same slug;
  // either way there is no resolved page (and no real image) to describe,
  // canonicalize, or share. Never expose anything about a design that
  // isn't genuinely published and resolvable right now.
  if (!design) {
    return { title: "Producto" };
  }

  const canonicalUrl = `${resolveSiteUrl().origin}/productos/${slug}`;
  // Real product copy when present (the same field VariantSelector renders
  // on the page itself — "" per the contract when genuinely unset, never
  // null), generic site copy only as the last resort. Never generated,
  // never invented.
  const description = design.description || SITE_DESCRIPTION_FALLBACK;
  // design.primaryImage is a contract-guaranteed non-null field for every
  // resolved (published) design (lib/contract.ts) — there is no code path
  // here where a resolved `design` lacks a real image, so no additional
  // "no image" branch is needed; buildStorefrontImageUrl always returns an
  // absolute, publicly-reachable URL (never a generated/placeholder one).
  const imageUrl = buildStorefrontImageUrl(design.primaryImage.url);

  return {
    title: design.name,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    // Next.js metadata merge rule (see docs/SEO.md's S7B residual note):
    // a segment's own `openGraph`/`twitter` object fully REPLACES its
    // parent's, it does not deep-merge. app/(public)/layout.tsx's
    // siteName/locale/type must therefore be repeated here explicitly, or
    // product pages would silently lose them the moment this route defines
    // its own openGraph object.
    openGraph: {
      title: design.name,
      description,
      url: canonicalUrl,
      siteName: "Hilitos",
      locale: "es_CO",
      type: "website",
      images: [{ url: imageUrl, alt: design.primaryImage.alt ?? design.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: design.name,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductoPage({ params }: Params) {
  const { slug } = await params;
  const result = await getStorefrontCatalog();

  if (result.status === "unavailable" || !result.catalog) {
    return (
      <main id="contenido" tabIndex={-1}>
        <Section labelledBy="producto-titulo" className="pt-10 md:pt-14">
          <h1 id="producto-titulo" className="sr-only">
            Producto no disponible
          </h1>
          <div className="max-w-xl">
            <CatalogStatusBanner status="unavailable" />
          </div>
        </Section>
      </main>
    );
  }

  const design = getDesignBySlug(result.catalog, slug);
  if (!design) {
    notFound();
  }

  // V-1 fix: resolve every image URL server-side, where STOREFRONT_IMAGE_HOST
  // (server-only) is actually available, and pass the resolved strings into
  // the Client Component as props. VariantSelector must never call
  // buildStorefrontImageUrl itself — see that component's own note.
  const primaryImageUrl = buildStorefrontImageUrl(design.primaryImage.url);
  const variantImageUrls: ResolvedVariantImageUrls = Object.fromEntries(
    design.variants.map((variant) => [variant.ref, buildStorefrontImageUrl(variant.image.url)]),
  );
  const related = getRelatedDesigns(result.catalog, design);
  const canonicalUrl = `${resolveSiteUrl().origin}/productos/${slug}`;
  const productJsonLd = buildProductJsonLd(design, primaryImageUrl, canonicalUrl);

  return (
    <main id="contenido" tabIndex={-1}>
      {/* Product structured data (Slice F): every field is sourced from the
          live catalog contract above — no rating, review count, or brand
          claim invented. Escaped via safeJsonLdString to keep the embed
          injection-safe regardless of catalog content. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(productJsonLd) }}
      />
      <ViewTracker event={{ name: "product_view", product_ref: design.designRef, category: design.category }} />
      <Section className="pt-10 md:pt-14">
        <Button href="/catalogo" variant="ghost" className="mb-6 -ml-2">
          ← Volver al catálogo
        </Button>
        {result.status === "stale" ? (
          <div className="mb-8 max-w-xl">
            <CatalogStatusBanner status="stale" fetchedAt={result.fetchedAt} />
          </div>
        ) : null}
        <VariantSelector design={design} primaryImageUrl={primaryImageUrl} variantImageUrls={variantImageUrls} />
      </Section>
      <RelatedDesigns designs={related} />
    </main>
  );
}
