// app/not-found.tsx — S3 branded errors (Amarillo pattern reuse). ROOT-LEVEL
// 404: this is the only boundary Next.js falls back to for a genuinely
// unmatched URL (e.g. a bogus path, or /productos or /colecciones with no
// slug), and it is also where an explicit notFound() call from
// productos/[slug]/page.tsx bubbles to, since no closer not-found.tsx exists
// under app/(public)/. Because it sits outside the (public) route group, it
// does not automatically inherit that group's layout — so it re-composes the
// same SkipLink/Header/Footer shell (unmodified components, verbatim usage)
// and re-imports styles/amarillo.css so focus-visible, the skip link, and
// #contenido's scroll offset all still work here. No fixture/product data is
// imported.
import "@/styles/amarillo.css";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="contenido">
        <Container className="flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <ThreadMotif className="max-w-xs opacity-70" />
          <p className="text-sm font-medium uppercase tracking-[var(--tracking-tight)] text-barro-hondo">
            Error 404
          </p>
          <EditorialHeading as="h1" className="text-3xl md:text-display">
            No encontramos esta página
          </EditorialHeading>
          <p className="max-w-md text-base leading-[var(--leading-relaxed)] text-text-muted">
            El enlace puede estar roto o la página ya no existe. Vuelve al inicio o explora el
            catálogo.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/" variant="primary">
              Ir a Inicio
            </Button>
            <Button href="/catalogo" variant="secondary">
              Ver Catálogo
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
