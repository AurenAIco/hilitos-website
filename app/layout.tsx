// app/layout.tsx — MINIMAL ROOT (SHELL0). SHARED (Violeta).
// Holds ONLY truly-global concerns shared by every surface (public + future
// admin): <html>/<body>, lang, fonts, the global foundation CSS
// (globals.css = Tailwind + tokens + @theme + body base) and metadataBase.
// Do NOT add surface-specific chrome, storefront CSS, or storefront metadata
// here — the public shell lives in app/(public)/layout.tsx and the future
// admin boundary in app/(admin)/layout.tsx (see docs/OWNERSHIP.md).
import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// FONT SETUP (interim, documented — P1A pack §7.5 / OQ#2):
// Fraunces (display) + Hanken Grotesk (body), both OFL-licensed, loaded via
// next/font/google, which downloads and SELF-HOSTS the files at build time
// (no runtime request to Google). If dedicated WOFF2 files + licenses are
// later vendored, switch to next/font/local without changing the variable
// names. Two families maximum; no script fonts. Fonts stay at ROOT so every
// surface (public + admin) gets the token font variables.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
});

// ROOT METADATA — metadataBase ONLY (universal origin for absolute URLs).
// It remains a documented placeholder until Gate A6 — the real custom domain
// stays on GitHub Pages/master until an authorized cutover. Storefront brand
// metadata (title/description/openGraph) lives in app/(public)/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className={`${fraunces.variable} ${hankenGrotesk.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
