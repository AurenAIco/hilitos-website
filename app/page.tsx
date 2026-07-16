// app/page.tsx — Homepage (AMARILLO, HILITOS-P1A-AMARILLO §6C).
// Server Component. Product content comes EXCLUSIVELY from the committed
// fixture (server-side import, S-5). Copy uses only facts already published
// by the brand on the live site (hilitos.co) or clearly-marked placeholders
// pending Mónica (§13). The named traps ("más de 500 familias", testimonials)
// are deliberately NOT carried over even though the legacy site shows them.
import Image from "next/image";
import { products, collections } from "@/lib/fixture";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { PendingBlock } from "@/components/editorial/PendingBlock";
import { ProductCard } from "@/components/product/ProductCard";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

const SPOTLIGHT_COLLECTION = "esenciales";

export default function HomePage() {
  const featured = products.filter((p) => p.featured === true);
  const categorySlugs = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => c !== null)),
  );
  const spotlight = collections.find((c) => c.slug === SPOTLIGHT_COLLECTION);
  const spotlightProducts = products
    .filter((p) => p.collection === SPOTLIGHT_COLLECTION)
    .slice(0, 3);
  // A hand-made piece for the craft section. The fixture's hand-made row also
  // happens to carry no images, so it exercises the branded ImagePlaceholder
  // fallback on the homepage (the null-price fallback is proven by ref 2288 in
  // the collection spotlight) — satisfying the S3 "prove the fallbacks" intent.
  const handmadePiece = products.find(
    (p) => p.collection === "hechos-a-mano" && p.images.length === 0,
  );

  return (
    <main id="contenido">
      {/* 1 · Editorial hero */}
      <Section labelledBy="hero-titulo" className="pt-10 md:pt-14">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="min-w-0 max-w-xl">
            <ThreadMotif className="mb-6 max-w-56" />
            <EditorialHeading as="h1" id="hero-titulo" className="text-display">
              Ajuar tejido con amor para los primeros días
            </EditorialHeading>
            <p className="mt-5 max-w-md text-lg leading-[var(--leading-relaxed)] text-text-muted">
              Prendas suaves y naturales, tejidas a mano para la piel más
              delicada.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/catalogo">Ver el catálogo</Button>
              <WhatsAppCTA />
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src="/brand/hero.jpg"
              alt="Conjunto de ajuar tejido para bebé sobre manta clara"
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </Section>

      {/* 2 · Category shortcuts (labels pending Mónica; links to planned /catalogo) */}
      <Section labelledBy="categorias-titulo" className="pt-0">
        <EditorialHeading as="h2" id="categorias-titulo" className="text-2xl">
          Explora por categoría
        </EditorialHeading>
        <ul className="mt-6 flex flex-wrap gap-2.5">
          {categorySlugs.map((slug) => (
            <li key={slug}>
              <Button href="/catalogo" variant="secondary" className="capitalize">
                {slug.replace(/-/g, " ")}
              </Button>
            </li>
          ))}
        </ul>
        <PendingBlock className="mt-5 max-w-2xl">
          Los nombres visibles de las categorías (hoy se muestran los slugs del
          fixture) y sus destinos definitivos requieren la lista aprobada.
        </PendingBlock>
      </Section>

      {/* 3 · Featured products (fixture featured: true) */}
      <Section labelledBy="destacados-titulo" className="border-y border-hairline bg-marfil">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <EditorialHeading as="h2" id="destacados-titulo" className="text-3xl">
            Piezas destacadas del archivo
          </EditorialHeading>
          <Button href="/catalogo" variant="ghost">
            Ver todo el catálogo →
          </Button>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
          {featured.map((product, i) => (
            <li key={product.ref}>
              <Reveal delayMs={i * 90}>
                <ProductCard product={product} priority={i === 0} />
              </Reveal>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4 · Catalog-entry / search visual band (NO search logic — link only) */}
      <Section bleed labelledBy="banda-catalogo-titulo" className="bg-crudo/50">
        <Container className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <EditorialHeading as="h2" id="banda-catalogo-titulo" className="text-2xl">
              El archivo completo, organizado para ti
            </EditorialHeading>
            <p className="mt-2 max-w-md text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Cada prenda vive en el catálogo con su referencia, colores y
              tallas.
            </p>
          </div>
          {/* Visual search affordance: links to /catalogo; implements NO search */}
          <Button
            href="/catalogo"
            variant="secondary"
            className="w-full max-w-sm justify-between bg-marfil md:w-96"
          >
            <span className="text-text-muted">Buscar en el catálogo…</span>
            <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" className="size-5 text-barro-hondo">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Button>
        </Container>
      </Section>

      {/* 5 · Collection spotlight (editorial copy pending Mónica) */}
      <Section labelledBy="coleccion-titulo">
        <div className="grid gap-10 md:grid-cols-[2fr_3fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-barro-hondo">Colección</p>
            <EditorialHeading as="h2" id="coleccion-titulo" className="mt-2 text-3xl capitalize">
              {spotlight?.title ?? spotlight?.slug.replace(/-/g, " ") ?? "Colección"}
            </EditorialHeading>
            <PendingBlock className="mt-4">
              Título editorial, descripción e imagen de la colección. Hoy se
              muestra el slug del fixture.
            </PendingBlock>
            <Button href={`/colecciones/${SPOTLIGHT_COLLECTION}`} variant="secondary" className="mt-6">
              Ver la colección
            </Button>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {spotlightProducts.map((product) => (
              <li key={product.ref}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* 6 · Craft and history */}
      <Section bleed labelledBy="oficio-titulo" className="bg-sage/15">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative order-last aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo md:order-first">
            <Image
              src="/brand/craft-1.jpg"
              alt="Pelele tejido a mano con bordado y gorro con pompón"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="min-w-0 max-w-lg">
            <EditorialHeading as="h2" id="oficio-titulo" className="text-3xl">
              Un legado tejido con amor y tiempo
            </EditorialHeading>
            <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
              Cada ajuar es tejido a mano con fibras naturales seleccionadas
              para la piel más delicada.
            </p>
            <ThreadMotif className="mt-6 max-w-48" />
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="/nosotros" variant="ghost">
                Conoce nuestra historia →
              </Button>
            </div>
            {handmadePiece ? (
              <figure className="mt-8 w-40">
                <ProductCard product={handmadePiece} />
                <figcaption className="mt-2 text-xs text-text-muted">
                  Una pieza hecha a mano del taller.
                </figcaption>
              </figure>
            ) : null}
          </div>
        </Container>
      </Section>

      {/* 7 · Trust / purchase process (describes the site's own WhatsApp loop) */}
      <Section labelledBy="proceso-titulo">
        <EditorialHeading as="h2" id="proceso-titulo" className="text-3xl">
          Así de simple
        </EditorialHeading>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Explora el catálogo",
              body: "Recorre el archivo de prendas con calma, desde tu celular.",
            },
            {
              title: "Elige tu prenda",
              body: "Cada pieza tiene su referencia, colores y tallas visibles.",
            },
            {
              title: "Escríbenos por WhatsApp",
              body: "Te acompañamos a confirmar la prenda con su referencia.",
            },
          ].map((step, i) => (
            <li key={step.title} className="rounded-lg border border-hairline bg-marfil p-6">
              <span aria-hidden="true" className="font-display text-3xl text-hilo">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-lg font-medium text-tinta">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-[var(--leading-relaxed)] text-text-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 8 · Neutral craft-quality (NO testimonials/counts — not verified) */}
      <Section bleed labelledBy="calidad-titulo" className="bg-crudo/50">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div className="max-w-lg">
            <EditorialHeading as="h2" id="calidad-titulo" className="text-3xl">
              Cada prenda lleva su referencia
            </EditorialHeading>
            <p className="mt-4 leading-[var(--leading-relaxed)] text-text-muted">
              El archivo de Hilitos se organiza por referencias — como las
              etiquetas colgantes de un taller. La referencia que ves aquí es
              la misma con la que confirmas tu prenda por WhatsApp.
            </p>
            <PendingBlock className="mt-5">
              Sección de prueba social (testimonios / cifras verificadas). Sin
              contenido verificado no se publica ningún claim.
            </PendingBlock>
          </div>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-crudo">
            <Image
              src="/brand/craft-2.jpg"
              alt="Pelele tejido de manga corta con cuello bordado y lazo"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </Container>
      </Section>

      {/* 9 · FAQ (published brand answers + marked pending items) */}
      <Section labelledBy="faq-titulo">
        <EditorialHeading as="h2" id="faq-titulo" className="text-3xl">
          Preguntas frecuentes
        </EditorialHeading>
        <div className="mt-8 max-w-2xl">
          {[
            {
              q: "¿Cómo compro una prenda?",
              a: "Explora el catálogo, elige la prenda y escríbenos por WhatsApp con su referencia. Te acompañamos en el resto.",
            },
            {
              q: "¿De qué material están hechas las prendas?",
              a: "Fibra natural suave, transpirable y resistente, ideal para la piel sensible del bebé.",
            },
            {
              q: "¿Cómo se lavan?",
              a: "En ciclo delicado con agua fría, sin dejar en remojo, y secado al aire libre para conservar la forma y suavidad de las fibras.",
            },
            {
              q: "¿Qué talla elijo para un recién nacido?",
              a: "La talla RN es ideal para recibir al bebé. Si ya nació, escríbenos y te asesoramos sobre la talla más adecuada.",
            },
          ].map((item) => (
            <details key={item.q} className="group border-b border-hairline">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-tinta [&::-webkit-details-marker]:hidden">
                <span className="font-medium">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="text-xl leading-none text-barro-hondo transition-transform duration-[var(--duration-fast)] group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-[var(--leading-relaxed)] text-text-muted">
                {item.a}
              </p>
            </details>
          ))}
          <PendingBlock className="mt-6">
            FAQs de envíos, pagos y cambios: requieren confirmación de las
            políticas vigentes antes de publicarse en el rediseño.
          </PendingBlock>
        </div>
      </Section>

      {/* 10 · Final WhatsApp CTA */}
      <Section bleed labelledBy="cta-final-titulo" className="bg-marfil">
        <Container className="flex flex-col items-center border-y border-hairline py-14 text-center">
          <ThreadMotif className="mb-6 max-w-64" />
          <EditorialHeading as="h2" id="cta-final-titulo" className="max-w-xl text-3xl">
            ¿Buscas el ajuar perfecto?
          </EditorialHeading>
          <p className="mt-3 max-w-md text-text-muted">
            Cuéntanos qué necesitas y te ayudamos a elegir la prenda ideal.
          </p>
          <div className="mt-7">
            <WhatsAppCTA />
          </div>
        </Container>
      </Section>
    </main>
  );
}
