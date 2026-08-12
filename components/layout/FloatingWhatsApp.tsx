// components/layout/FloatingWhatsApp.tsx — discreet floating WhatsApp entry
// point across the public storefront (2026-08 brand refresh, approved by
// Mónica/Juanpa). Same contract as WhatsAppCTA: PRESENTATIONAL ONLY — the
// href is built upstream by lib/whatsapp.ts (Verde-owned); this component
// never builds a message, embeds a number, or reads process.env. Fail-closed:
// when no href is supplied (WhatsApp number unconfigured) it renders NOTHING —
// a floating dead-end button would be worse than no button.
//
// Brand rule: Hilitos treatment (warm ivory disc, dusty-pink ring, dusty-pink
// glyph) — never WhatsApp green. "use client" only for the same non-blocking
// analytics click ping WhatsAppCTA uses.
"use client";

import { track } from "@/lib/analytics";
import { WhatsAppIcon } from "./WhatsAppCTA";

export function FloatingWhatsApp({ href }: { href?: string | null }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      onClick={() =>
        track({ name: "whatsapp_click", source: "floating", product_ref: null })
      }
      className="fixed bottom-5 right-5 z-40 grid size-13 place-items-center rounded-pill border border-barro bg-marfil text-barro-hondo shadow-md transition-colors duration-[var(--duration-base)] hover:bg-crudo/70 print:hidden"
    >
      {/* Icon inherits the deep dusty rose (AA-safe ≥3:1 on ivory for a
          meaningful graphic) from the parent's text color. */}
      <WhatsAppIcon />
    </a>
  );
}
