// app/(public)/personalizados/page.tsx — Personalizados (2026-08 brand
// refresh §16). New frontend-only editorial route: approved copy + the
// existing fail-closed WhatsApp conversion seam (lib/whatsapp.ts). No
// backend functionality, no product-data involvement — personalization is
// arranged entirely in the WhatsApp conversation, matching how Hilitos
// actually sells.
import type { Metadata } from "next";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";
import { buildPersonalizadosWhatsAppHref } from "@/lib/whatsapp";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

export const metadata: Metadata = {
  title: "Personalizados",
  // Reuses the section's approved copy — no new claim invented for SEO.
  description:
    "Personalizamos algunas de nuestras prendas con el nombre de tu bebé bordado con amor en cada detalle.",
  alternates: {
    canonical: `${resolveSiteUrl().origin}/personalizados`,
  },
};

// DRAFT ASSET: name-embroidery photography is not in the repo yet — craft-2
// (embroidered rosette collar) holds the slot; swap ONLY this constant when
// the final photo is supplied.
const PERSONALIZADOS_IMAGE = {
  src: "/brand/craft-2.jpg",
  alt: "Prenda tejida con cuello bordado a mano",
};

export default function PersonalizadosPage() {
  const whatsappHref = buildPersonalizadosWhatsAppHref();

  return (
    <main id="contenido" tabIndex={-1}>
      <Section labelledBy="personalizados-titulo" className="pt-10 md:pt-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="min-w-0 max-w-xl">
            <p className="text-xs font-medium tracking-[0.18em] text-barro-hondo">
              PERSONALIZADOS
            </p>
            <EditorialHeading as="h1" id="personalizados-titulo" className="mt-3 text-display">
              Hazlo aún más especial
            </EditorialHeading>
            <p className="mt-6 max-w-md text-lg leading-[var(--leading-relaxed)] text-text-muted">
              Personalizamos algunas de nuestras prendas con el nombre de tu
              bebé bordado con amor en cada detalle.
            </p>
            <div className="mt-8">
              <WhatsAppCTA
                href={whatsappHref}
                label="QUIERO PERSONALIZAR"
                className="tracking-[0.08em]"
                analyticsSource="personalizados"
              />
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src={PERSONALIZADOS_IMAGE.src}
              alt={PERSONALIZADOS_IMAGE.alt}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Section>

      {/* Cómo funciona — mirrors the site's real WhatsApp loop; no invented
          pricing/turnaround claims. */}
      <Section bleed labelledBy="personalizados-como-titulo" className="bg-crudo/40">
        <div className="mx-auto w-full max-w-page px-[var(--container-gutter)]">
          <EditorialHeading as="h2" id="personalizados-como-titulo" className="text-3xl">
            Así de fácil
          </EditorialHeading>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Elige la prenda",
                body: "Explora el catálogo y encuentra la prenda que quieres personalizar.",
              },
              {
                title: "Cuéntanos el nombre",
                body: "Escríbenos por WhatsApp con la referencia y el nombre de tu bebé.",
              },
              {
                title: "La bordamos con amor",
                body: "Confirmamos contigo los detalles y preparamos tu prenda especial.",
              },
            ].map((step, i) => (
              <li key={step.title} className="rounded-lg border border-hairline bg-marfil p-6">
                <span aria-hidden="true" className="font-display text-3xl text-barro">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-lg font-medium text-tinta">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-[var(--leading-relaxed)] text-text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <WhatsAppCTA
              href={whatsappHref}
              label="QUIERO PERSONALIZAR"
              className="tracking-[0.08em]"
              analyticsSource="personalizados_como"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
