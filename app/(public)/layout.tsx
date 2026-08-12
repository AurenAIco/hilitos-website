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
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { buildGenericWhatsAppHref } from "@/lib/whatsapp";

// STOREFRONT METADATA — 2026-08 brand refresh. Default title and description
// use ONLY the copy approved by Mónica/Juanpa for the redesign ("Hilitos —
// Ropita que cuida con amor" + the approved hero body facts). No invented
// claims (no founding year, no counts, no testimonials in metadata).
export const metadata: Metadata = {
  title: {
    default: "Hilitos — Ropita que cuida con amor",
    template: "%s · Hilitos",
  },
  description:
    "Ropita artesanal para recién nacidos y bebés de 0, 3 y 6 meses. Hecha en Santander con 100% algodón.",
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
      {/* 2026-08 brand refresh: discreet floating WhatsApp entry point on
          every public route. Href built here (Server Component) by the
          Verde-owned builder; renders nothing when unconfigured. */}
      <FloatingWhatsApp href={buildGenericWhatsAppHref()} />
    </>
  );
}
