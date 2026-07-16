// app/(public)/layout.tsx — PUBLIC STOREFRONT SHELL (SHELL0). SHARED (Violeta)
// composing Amarillo-owned parts. Owns everything storefront-specific that the
// root layout used to hold: the document-level storefront CSS, the brand
// metadata, and the SkipLink/Header/Footer composition (moved VERBATIM from
// the P1A root layout — components unmodified, Amarillo-owned).
// Renders NO <html>/<body> (root owns those) and NO <main> — every public
// page owns its <main id="contenido"> landmark.
import type { Metadata } from "next";
// AMARILLO document-level global layer (skip-link, #contenido offset,
// :focus-visible, stitch underline, reveal motion, reduced-motion). Import
// RELOCATED from the root layout — content untouched, imported UNLAYERED.
// Cascade order is preserved: the parent root layout's globals.css still
// precedes this child-segment CSS, exactly as before SHELL0.
import "@/styles/amarillo.css";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// STOREFRONT METADATA (moved verbatim from the P1A root layout — §7.6 of the
// P1A pack): neutral, non-fabricating; copy pending Mónica approval; do NOT
// add business claims (no founding year, no counts, no testimonials).
export const metadata: Metadata = {
  title: {
    default: "Hilitos",
    template: "%s · Hilitos",
  },
  description: "Catálogo en línea de Hilitos.", // TODO(Mónica): approved copy pending — keep neutral.
  openGraph: {
    siteName: "Hilitos",
    locale: "es_CO",
    type: "website",
  },
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SHELL COMPOSITION (originally resolved by HILITOS-P1A-AMARILLO OQ#5 in the
  // root layout; relocated here by SHELL0): same effective DOM order, no
  // wrapper element added.
  return (
    <>
      <SkipLink />
      <Header />
      {children}
      <Footer />
    </>
  );
}
