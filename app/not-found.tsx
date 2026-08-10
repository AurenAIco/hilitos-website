// app/not-found.tsx — S3 branded errors (Amarillo pattern reuse). ROOT-LEVEL
// 404 for URLs that match NO route at all and therefore enter no route group:
// a bogus top-level path, or /productos and /colecciones with no slug. Such a
// request activates only app/layout.tsx (html/body/fonts/globals.css), so this
// boundary must bring the storefront shell itself — it re-composes the same
// SkipLink/Header/Footer (unmodified components, verbatim usage) and re-imports
// styles/amarillo.css so focus-visible, the skip link, and #contenido's scroll
// offset all still work here. No fixture/product data is imported.
//
// NOT the boundary for notFound() raised INSIDE the (public) group — that is
// app/(public)/not-found.tsx, which renders content only because
// app/(public)/layout.tsx has already supplied the shell. Adding the shell here
// as well is what produced the duplicate landmarks fixed in that file; see its
// header and tests/errors/s3-notfound-composition.test.ts. Keep the two
// boundaries' rendered copy identical — one 404 voice for the storefront.
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
      <main id="contenido" tabIndex={-1}>
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
