// components/layout/WhatsAppCTA.tsx — AMARILLO. PRESENTATIONAL ONLY.
// Renders the WhatsApp affordance with the RESERVED --whatsapp green.
// Accepts an already-built href from a caller (lib/whatsapp.ts, Verde-owned).
// This component must NEVER build the message, embed or guess a phone
// number, or read process.env — and it must NEVER ship a believable-but-fake
// wa.me link (mission pack §6B). When no valid href is supplied (missing/
// invalid WhatsApp configuration upstream), it renders a disabled,
// non-interactive control instead of a clickable dead end (slice S6).
//
// A11Y: label/icon use --tinta on --whatsapp (≈7.5:1). White-on-green fails
// AA. The disabled state is exempt from that contrast requirement (WCAG
// 1.4.11 excludes inactive UI components) but keeps layout/size identical.
function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`size-5 shrink-0 ${className}`}
    >
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2.05 22l5.3-1.39a9.87 9.87 0 0 0 4.69 1.19h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.22-8.24 8.22Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.8-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

export function WhatsAppCTA({
  href,
  label = "Escríbenos por WhatsApp",
  compact = false,
  className = "",
}: {
  /** Real wa.me href built by lib/whatsapp.ts. Omit (or pass null) when no
   * WhatsApp number is configured — the CTA renders disabled instead of a
   * fake link. This component never fabricates one on its own. */
  href?: string | null;
  label?: string;
  /** Compact: icon-first pill for the header. */
  compact?: boolean;
  className?: string;
}) {
  const sizeClassName = compact ? "px-4 text-sm" : "px-6 py-2 text-sm";
  const sharedClassName = `inline-flex min-h-11 items-center justify-center gap-2 rounded-pill font-medium ${sizeClassName} ${className}`;

  const content = (
    <>
      <WhatsAppIcon />
      <span className={compact ? "hidden sm:inline" : ""}>{label}</span>
      {compact ? <span className="sr-only sm:hidden">{label}</span> : null}
    </>
  );

  if (!href) {
    return (
      <button
        type="button"
        disabled
        aria-label={`${label} (no disponible por el momento)`}
        className={`${sharedClassName} cursor-not-allowed bg-whatsapp/35 text-tinta/60`}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={`${sharedClassName} bg-whatsapp text-tinta transition-opacity duration-[var(--duration-base)] hover:opacity-85`}
    >
      {content}
    </a>
  );
}
