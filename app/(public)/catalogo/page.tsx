// app/(public)/catalogo/page.tsx — VERDE (Gate G5: storefront catalog
// connect). Replaces the SHELL0 route skeleton. Server Component: fetches
// the live StorefrontCatalogV2 (lib/catalog/storefront.ts) with ISR, groups
// designs by the frozen six-category order, and renders the featured
// ("destacados") rail. See lib/catalog/storefront.ts for the full fallback
// contract (ok / stale / unavailable) — this page renders all three states
// honestly; it never falls back to the synthetic V2 fixture.
import type { Metadata } from "next";
import { getFeaturedDesigns, getStorefrontCatalog, groupDesignsByCategory } from "@/lib/catalog/storefront";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { DesignCard } from "@/components/product/DesignCard";
import { FeaturedDesigns } from "@/components/product/FeaturedDesigns";
import { CatalogStatusBanner } from "@/components/catalog/CatalogStatusBanner";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// NOTE: Next.js requires this route-segment-config export to be a static
// literal (it is extracted without executing module code) — it cannot be an
// imported identifier, even a constant one. Kept numerically identical to
// lib/catalog/storefront.ts's CATALOG_REVALIDATE_SECONDS (also used inside
// that module's own fetch(..., { next: { revalidate } }) call) by
// convention; if you change one, change both.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Catálogo",
  description:
    "Explora el catálogo de Hilitos: ajuar artesanal tejido a mano para bebés, organizado por categoría, colores y tallas.",
  alternates: {
    canonical: `${resolveSiteUrl().origin}/catalogo`,
  },
};

export default async function CatalogoPage() {
  const result = await getStorefrontCatalog();

  if (result.status === "unavailable" || !result.catalog) {
    return (
      <main id="contenido">
        <Section labelledBy="catalogo-titulo" className="pt-10 md:pt-14">
          <EditorialHeading as="h1" id="catalogo-titulo" className="text-display">
            Catálogo
          </EditorialHeading>
          <div className="mt-8 max-w-xl">
            <CatalogStatusBanner status="unavailable" />
          </div>
        </Section>
      </main>
    );
  }

  const { catalog } = result;
  const featured = getFeaturedDesigns(catalog);
  const grouped = groupDesignsByCategory(catalog).filter((g) => g.designs.length > 0);

  return (
    <main id="contenido">
      <Section labelledBy="catalogo-titulo" className="pt-10 md:pt-14">
        <EditorialHeading as="h1" id="catalogo-titulo" className="text-display">
          Catálogo
        </EditorialHeading>
        {result.status === "stale" ? (
          <div className="mt-6 max-w-xl">
            <CatalogStatusBanner status="stale" fetchedAt={result.fetchedAt} />
          </div>
        ) : null}
      </Section>

      <FeaturedDesigns designs={featured} />

      {grouped.length === 0 ? (
        <Section>
          <p className="max-w-md text-text-muted">
            Aún no hay piezas publicadas en el catálogo. Vuelve pronto.
          </p>
        </Section>
      ) : (
        grouped.map(({ category, designs }) => (
          <Section key={category.slug} labelledBy={`categoria-${category.slug}-titulo`}>
            <EditorialHeading as="h2" id={`categoria-${category.slug}-titulo`} className="text-2xl capitalize">
              {category.name ?? category.slug.replace(/-/g, " ")}
            </EditorialHeading>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
              {designs.map((design) => (
                <li key={design.designRef}>
                  <DesignCard design={design} />
                </li>
              ))}
            </ul>
          </Section>
        ))
      )}
    </main>
  );
}
