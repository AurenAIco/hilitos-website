// components/ui/Button.tsx — AMARILLO. Base button/link.
// Variants: primary | secondary | ghost. WhatsApp is NOT a variant here —
// WhatsApp actions use the dedicated <WhatsAppCTA/> so --whatsapp stays
// structurally reserved (mission pack §9.4).
import Link from "next/link";
import type { ReactNode, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-6 py-2 text-sm font-medium transition-colors duration-[var(--duration-base)] ease-[var(--ease-standard)]";

const VARIANTS: Record<Variant, string> = {
  // Primary fill/hover are the approved 2026-08 brand-refresh values
  // (--rosa-boton / --rosa-boton-hover): dusty-pink fill, white label.
  primary: "bg-rosa-boton text-white hover:bg-rosa-boton-hover",
  secondary:
    "border border-barro bg-transparent text-barro-hondo hover:bg-crudo/60",
  ghost: "bg-transparent text-barro-hondo hover:bg-crudo/50",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  /** When present, renders a <Link> (or <a> for hash/external) instead of <button>. */
  href?: string;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className">;

export function Button({ children, variant = "primary", href, className = "", ...rest }: Props) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`;
  if (href) {
    if (href.startsWith("#")) {
      return (
        <a href={href} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
