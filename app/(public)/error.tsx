// app/(public)/error.tsx — S3 branded errors. Route-level runtime error
// boundary for every page under the (public) segment (/, /catalogo,
// /productos/[slug], /colecciones/[slug], /nosotros, /privacy). Must be a
// Client Component (Next.js requirement for error.tsx). The enclosing
// app/(public)/layout.tsx still renders around this boundary, so SkipLink /
// Header / Footer keep working here for free — nothing is re-imported.
//
// Deliberately does not read `error.message`, `error.stack`, or
// `error.digest` anywhere: the message shown is a fixed, honest, generic
// Spanish string, never anything derived from the thrown error itself.
"use client";

import { Container } from "@/components/ui/Container";
import { EditorialHeading } from "@/components/editorial/EditorialHeading";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";
import { Button } from "@/components/ui/Button";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="contenido">
      <Container className="flex flex-col items-center gap-6 py-20 text-center md:py-28">
        <ThreadMotif className="max-w-xs opacity-70" />
        <p className="text-sm font-medium uppercase tracking-[var(--tracking-tight)] text-barro-hondo">
          Algo salió mal
        </p>
        <EditorialHeading as="h1" className="text-3xl md:text-display">
          No pudimos cargar esta página
        </EditorialHeading>
        <p className="max-w-md text-base leading-[var(--leading-relaxed)] text-text-muted">
          Ocurrió un error inesperado de nuestro lado. Puedes intentarlo de nuevo o volver al
          inicio.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button type="button" variant="primary" onClick={() => reset()}>
            Intentar de nuevo
          </Button>
          <Button href="/" variant="secondary">
            Ir a Inicio
          </Button>
          <Button href="/catalogo" variant="ghost">
            Ver Catálogo
          </Button>
        </div>
      </Container>
    </main>
  );
}
