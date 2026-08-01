// app/(public)/colecciones/[slug]/page.tsx — VERDE (Slice S2 — collections
// live). Replaces the SHELL0 route skeleton. Server Component: validates
// the slug against the frozen six-category union (lib/catalog/
// collectionRoute.ts) BEFORE ever fetching — any other slug is a real
// Next.js notFound(), never a 200. For a valid slug, fetches the live
// StorefrontCatalogV2 (lib/catalog/storefront.ts) with ISR and renders only
// that category's designs — see app/(public)/catalogo/page.tsx for the
// sibling all-categories listing this route shares its fetch contract and
// card component with (DesignCard; no duplicate catalog parsing here).
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStorefrontCatalog } from "@/lib/catalog/storefront";
import { getCollectionMeta, isCollectionSlug, resolveCollectionView } from "@/lib/catalog/collectionRoute";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { DesignCard } from "@/components/product/DesignCard";
import { CatalogStatusBanner } from "@/components/catalog/CatalogStatusBanner";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// See app/(public)/catalogo/page.tsx's identical note: this must be a static
// literal, kept in sync with lib/catalog/storefront.ts's
// CATALOG_REVALIDATE_SECONDS by convention.
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  if (!isCollectionSlug(slug)) {
    // No canonical for an invalid slug — the page component below still
    // calls notFound() for this same slug; a canonical pointing at a route
    // that 404s would be self-contradictory.
    return { title: "Colección" };
  }
  const result = await getStorefrontCatalog();
  const meta = getCollectionMeta(slug, result.catalog);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${resolveSiteUrl().origin}/colecciones/${slug}`,
    },
  };
}

export default async function ColeccionPage({ params }: Params) {
  const { slug } = await params;

  if (!isCollectionSlug(slug)) {
    notFound();
  }

  const result = await getStorefrontCatalog();
  const meta = getCollectionMeta(slug, result.catalog);
  const view = resolveCollectionView(result, slug);

  if (view.kind === "unavailable") {
    return (
      <main id="contenido">
        <Section labelledBy="coleccion-titulo" className="pt-10 md:pt-14">
          <EditorialHeading as="h1" id="coleccion-titulo" className="text-display">
            {meta.title}
          </EditorialHeading>
          <p className="mt-2 max-w-xl text-text-muted">{meta.description}</p>
          <div className="mt-8 max-w-xl">
            <CatalogStatusBanner status="unavailable" />
          </div>
        </Section>
      </main>
    );
  }

  const { designs, stale, fetchedAt } = view;

  return (
    <main id="contenido">
      <Section labelledBy="coleccion-titulo" className="pt-10 md:pt-14">
        <EditorialHeading as="h1" id="coleccion-titulo" className="text-display">
          {meta.title}
        </EditorialHeading>
        <p className="mt-2 max-w-xl text-text-muted">{meta.description}</p>
        {stale ? (
          <div className="mt-6 max-w-xl">
            <CatalogStatusBanner status="stale" fetchedAt={fetchedAt} />
          </div>
        ) : null}
      </Section>

      {designs.length === 0 ? (
        <Section>
          <p className="max-w-md text-text-muted">
            Aún no hay piezas publicadas en {meta.title}. Vuelve pronto.
          </p>
        </Section>
      ) : (
        <Section>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
            {designs.map((design) => (
              <li key={design.designRef}>
                <DesignCard design={design} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </main>
  );
}
