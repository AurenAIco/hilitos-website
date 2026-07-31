// app/(public)/not-found.tsx — S3 branded errors, COMPOSITION CORRECTION
// (independent Opus review, blocking finding S3-B1).
//
// WHY THIS FILE EXISTS. Next.js resolves a `notFound()` call to the CLOSEST
// not-found boundary, and renders it inside every layout that is already
// active for the matched route. When a page under (public) — today only
// app/(public)/productos/[slug]/page.tsx — calls notFound(), the enclosing
// app/(public)/layout.tsx has ALREADY rendered SkipLink/Header/Footer. Before
// this file existed, that call fell through to the root app/not-found.tsx,
// which composes the shell itself, so `/productos/<slug-desconocido>` shipped
// TWO headers, TWO footers, TWO skip links, two <nav aria-label="Principal">,
// two <nav aria-label="Pie de página"> and two MobileNav triggers — both
// pointing at aria-controls="menu-movil", so opening both produced a
// duplicate id and two concurrent aria-modal dialogs.
//
// This boundary therefore renders CONTENT ONLY. The public shell has exactly
// one provider: app/(public)/layout.tsx. Deliberately absent here:
//   - <SkipLink/>, <Header/>, <Footer/>  — the layout above already renders them
//   - import "@/styles/amarillo.css"     — the layout above already imports it
//   - <html>/<body>                      — single-root invariant (docs/OWNERSHIP.md §2.1)
// The root app/not-found.tsx keeps its full shell composition, because it is
// the boundary for genuinely unmatched URLs that never enter this route group
// and so inherit no public layout.
//
// Copy is intentionally identical to app/not-found.tsx: one 404 voice for the
// storefront regardless of which boundary served it. Guarded against drift by
// tests/errors/s3-notfound-composition.test.ts.
//
// No fixture, product or catalog data is imported, and nothing derived from a
// thrown error is ever rendered — a 404 carries no error object at all.
import { Container } from "@/components/ui/Container";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { Button } from "@/components/ui/Button";

export default function PublicNotFound() {
  return (
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
  );
}
