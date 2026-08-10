// components/home/BenefitsStrip.tsx — four-benefit strip directly below the
// hero (2026-08 brand refresh §10). Thin, refined line iconography in the
// Hilitos dusty-rose family — deliberately small and quiet, never oversized
// decorative icons. Copy is the approved four-benefit set, verbatim.
import type { ReactNode } from "react";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

function BenefitIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-7 shrink-0 text-barro-hondo"
    >
      {children}
    </svg>
  );
}

const BENEFITS = [
  {
    label: "100% algodón",
    icon: (
      // Yarn ball with a trailing thread
      <>
        <circle cx="11" cy="12" r="7" />
        <path d="M5.5 8.5c3.5 1 7.5 1 11 0M5.5 15.5c3.5-1 7.5-1 11 0M11 5c-2 4.5-2 9.5 0 14" />
        <path d="M18 12c1.5 1 2.5 3 2.5 5.5" />
      </>
    ),
  },
  {
    label: "Hecho artesanalmente",
    icon: (
      // Crossed knitting needles over a loop
      <>
        <path d="M4 20 19 5M20 20 5 5" />
        <circle cx="12" cy="12" r="3.2" />
      </>
    ),
  },
  {
    label: "Hecho en Colombia",
    icon: (
      // Heart with a stitch line
      <>
        <path d="M12 20s-7-4.6-8.6-9A4.8 4.8 0 0 1 12 7.6 4.8 4.8 0 0 1 20.6 11C19 15.4 12 20 12 20Z" />
        <path d="M8.5 11.5h1.5m2 0h1.5m2 0H17" strokeDasharray="1.6 1.8" />
      </>
    ),
  },
  {
    label: "Envíos nacionales",
    icon: (
      // Simple wrapped parcel with ribbon
      <>
        <rect x="4" y="8" width="16" height="12" rx="1.2" />
        <path d="M4 12h16M12 8v12M9 8c0-2 1.3-3.2 3-3.2S15 6 15 8" />
      </>
    ),
  },
] as const;

export function BenefitsStrip() {
  return (
    <Section bleed labelledBy="beneficios-titulo" className="border-y border-hairline bg-crudo/40 !py-10">
      <Container>
        <h2 id="beneficios-titulo" className="sr-only">
          Por qué Hilitos
        </h2>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <li key={benefit.label} className="flex flex-col items-center gap-3 text-center">
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <span className="text-sm font-medium tracking-[0.04em] text-tinta">
                {benefit.label}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
