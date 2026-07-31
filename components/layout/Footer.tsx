// components/layout/Footer.tsx — AMARILLO. Shared public footer. Copy uses
// only facts already published by the brand on the live site (hilitos.co):
// "Ajuar artesanal para bebés · Bucaramanga, Colombia".
import Link from "next/link";
import { NAV_ITEMS } from "./nav-items";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { ThreadMotif } from "@/components/editorial/ThreadMotif";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-crudo/40">
      <div className="mx-auto w-full max-w-page px-[var(--container-gutter)] py-12">
        <ThreadMotif className="mb-10 opacity-70" />
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <p className="font-display text-2xl text-tinta">Hilitos</p>
            <p className="mt-2 text-sm leading-[var(--leading-relaxed)] text-text-muted">
              Ajuar artesanal para bebés · Bucaramanga, Colombia
            </p>
          </div>

          <nav aria-label="Pie de página" className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex min-h-11 w-fit items-center text-sm text-tinta hover:text-barro-hondo"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/privacy"
              className="inline-flex min-h-11 w-fit items-center text-sm text-tinta hover:text-barro-hondo"
            >
              Privacidad
            </Link>
          </nav>

          <div className="md:max-w-xs">
            <p className="mb-3 text-sm text-text-muted">¿Tienes preguntas? Escríbenos.</p>
            <WhatsAppCTA />
          </div>
        </div>
        <p className="mt-12 border-t border-hairline pt-6 text-xs text-text-muted">
          © {new Date().getFullYear()} Hilitos
        </p>
      </div>
    </footer>
  );
}
