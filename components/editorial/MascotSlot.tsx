// components/editorial/MascotSlot.tsx — replaceable slot for the secondary
// "Hilitos by MM" chick/egg mascot artwork (2026-08 brand refresh §7).
//
// The mascot asset is NOT in the repo yet and must not be recreated or
// substituted with a downloaded lookalike. When the approved artwork lands,
// drop it at public/brand/mascota.png (transparent background preferred) and
// set MASCOT_SRC below — nothing else needs to change. Until then this
// component renders nothing, so no route ever shows a broken image or an
// unapproved stand-in.
//
// Brand rule: the mascot is SECONDARY. It never replaces the Cormorant
// wordmark in the header; use it sparingly (footer, small brand details).
import Image from "next/image";

const MASCOT_SRC: string | null = null; // e.g. "/brand/mascota.png" once the approved asset exists

export function MascotSlot({ className = "" }: { className?: string }) {
  if (!MASCOT_SRC) return null;
  return (
    <Image
      src={MASCOT_SRC}
      alt="Mascota Hilitos by MM"
      width={56}
      height={56}
      className={`h-14 w-14 object-contain ${className}`}
    />
  );
}
