// app/layout.tsx — SHARED (Violeta/foundation): shell seam, fonts, metadata.
// Do NOT edit without Violeta approval (see docs/OWNERSHIP.md).
import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// FONT SETUP (interim, documented — mission pack §7.5 / OQ#2):
// Fraunces (display) + Hanken Grotesk (body), both OFL-licensed, loaded via
// next/font/google, which downloads and SELF-HOSTS the files at build time
// (no runtime request to Google). If dedicated WOFF2 files + licenses are
// later vendored, switch to next/font/local without changing the variable
// names. Two families maximum; no script fonts.
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

// METADATA SKELETON (§7.6) — neutral, non-fabricating. Copy is pending Mónica
// approval; do NOT add business claims (no founding year, no counts, no
// testimonials). metadataBase is a documented placeholder until Gate A6 — the
// real custom domain stays on GitHub Pages/master until an authorized cutover.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SHELL COMPOSITION SEAM:
  // Amarillo's shared <Header/> and <Footer/> are composed HERE post-HILITOS-P1A-AMARILLO,
  // per the Violeta seam decision (resolves Amarillo Open Question #5). Do not implement them now.
  return (
    <html lang="es-CO" className={`${fraunces.variable} ${hankenGrotesk.variable} antialiased`}>
      <body>
        {/* <Header/> — Amarillo, later */}
        {children}
        {/* <Footer/> — Amarillo, later */}
      </body>
    </html>
  );
}
