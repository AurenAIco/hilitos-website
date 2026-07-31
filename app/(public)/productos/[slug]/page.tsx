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
import { buildStorefrontImageUrl, getDesignBySlug, getStorefrontCatalog } from "@/lib/catalog/storefront";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { CatalogStatusBanner } from "@/components/catalog/CatalogStatusBanner";
import { VariantSelector, type ResolvedVariantImageUrls } from "@/components/product/VariantSelector";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// See app/(public)/catalogo/page.tsx's identical note: this must be a static
// literal, kept in sync with lib/catalog/storefront.ts's
// CATALOG_REVALIDATE_SECONDS by convention.
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const result = await getStorefrontCatalog();
  const design = result.catalog ? getDesignBySlug(result.catalog, slug) : undefined;
  // No canonical when the design can't be resolved (unavailable catalog or
  // unknown slug) — the page below either shows the honest "unavailable"
  // state or calls notFound() for this same slug; either way there is no
  // resolved page to canonicalize.
  if (!design) {
    return { title: "Producto" };
  }
  return {
    title: design.name,
    alternates: {
      canonical: `${resolveSiteUrl().origin}/productos/${slug}`,
    },
  };
}

export default async function ProductoPage({ params }: Params) {
  const { slug } = await params;
  const result = await getStorefrontCatalog();

  if (result.status === "unavailable" || !result.catalog) {
    return (
      <main id="contenido">
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

  return (
    <main id="contenido">
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
    </main>
  );
}
