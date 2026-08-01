// app/global-error.tsx — S3 branded errors. Root-level FATAL boundary: only
// fires when an error escapes every other boundary (e.g. app/layout.tsx or
// an app/(public)/layout.tsx failure that app/(public)/error.tsx cannot
// catch, since a segment's error.tsx never catches errors thrown by its own
// layout.tsx). Per Next.js contract, global-error.tsx REPLACES the entire
// root layout for this render, so it must render its own <html>/<body> (the
// one documented exception to the single-root invariant in
// docs/OWNERSHIP.md §2.1) and must be a Client Component.
//
// Deliberately minimal and dependency-light — this is the last-resort safety
// net, so it avoids next/font (styles/tokens.css already defines safe
// non-font fallbacks for --font-display/--font-body) and reuses no other
// app component beyond next/link, using a plain <button> instead of the
// Button primitive so a defect there can never take this fallback down with
// it. It never reads `error.message`, `error.stack`, or `error.digest`.
"use client";

import Link from "next/link";
import "./globals.css";
import "@/styles/amarillo.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es-CO">
      <body className="bg-marfil text-tinta antialiased">
        <main id="contenido" className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[var(--tracking-tight)] text-barro-hondo">
            Error inesperado
          </p>
          <h1 className="font-display text-3xl font-medium leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-tinta md:text-display">
            Algo salió mal
          </h1>
          <p className="max-w-md text-base leading-[var(--leading-relaxed)] text-text-muted">
            No pudimos cargar la aplicación. Intenta de nuevo en unos momentos.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-barro-hondo px-6 py-2 text-sm font-medium text-marfil transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)] hover:bg-tinta"
            >
              Reintentar
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-barro-hondo bg-transparent px-6 py-2 text-sm font-medium text-barro-hondo transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)] hover:bg-crudo/60"
            >
              Ir a Inicio
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
