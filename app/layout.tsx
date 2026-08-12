// app/layout.tsx — MINIMAL ROOT (SHELL0). SHARED (Violeta).
// Holds ONLY truly-global concerns shared by every surface (public + future
// admin): <html>/<body>, lang, fonts, the global foundation CSS
// (globals.css = Tailwind + tokens + @theme + body base) and metadataBase.
// Do NOT add surface-specific chrome, storefront CSS, or storefront metadata
// here — the public shell lives in app/(public)/layout.tsx and the future
// admin boundary in app/(admin)/layout.tsx (see docs/OWNERSHIP.md).
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { resolveSiteUrl } from "@/lib/seo/siteUrl";

// FONT SETUP (2026-08 brand refresh, approved by Mónica/Juanpa):
// Cormorant Garamond (display/emotional headings, SemiBold) + Montserrat
// (body/nav/buttons/prices, Regular+Medium), both OFL-licensed, loaded via
// next/font/google, which downloads and SELF-HOSTS the files at build time
// (no runtime request to Google). If dedicated WOFF2 files + licenses are
// later vendored, switch to next/font/local without changing the variable
// names. Two families maximum; no script fonts. Fonts stay at ROOT so every
// surface (public + admin) gets the token font variables.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// ROOT METADATA (S7A — SEO foundation). Still holds no brand/storefront
// content (per this file's own rule above) — only surface-agnostic
// technical defaults:
//   - metadataBase, now via lib/seo/siteUrl.ts so it never defaults to
//     localhost on a real Vercel deployment (see that file for the
//     resolution contract);
//   - openGraph.type / twitter.card: page-shape declarations, not brand
//     copy — `locale` here just mirrors the `lang="es-CO"` already on
//     <html> below, same as everywhere else in this file.
// app/(public)/layout.tsx (Violeta-owned; editing it requires Violeta's
// shared-file approval per docs/OWNERSHIP.md §2 — out of S7A's authorized
// scope) already owns title/description/openGraph.siteName for every
// storefront route, and per Next.js metadata-merge semantics a segment's
// own `openGraph` object fully REPLACES (not deep-merges) the parent's — so
// this root openGraph's `type`/`locale` are overwritten there too (with the
// identical values), and any OG image would need to be added at THAT layer
// to ever reach a real storefront page. `twitter` is NOT redefined by
// app/(public)/layout.tsx, so the twitter default below does apply, as-is,
// to every public route. See docs/SEO.md "S7B residual" for the full
// reasoning and what's left for Violeta/S7B.
const { origin: SITE_ORIGIN } = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  openGraph: {
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

// Matches --marfil (styles/tokens.css) — the site's primary surface/ivory
// background token. Not a new brand decision: reusing the existing frozen
// token value for the browser-chrome theme color.
export const viewport: Viewport = {
  themeColor: "#FFF9F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${cormorant.variable} ${montserrat.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
