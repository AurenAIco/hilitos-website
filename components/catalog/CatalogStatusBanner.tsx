// components/catalog/CatalogStatusBanner.tsx
// VERDE (Gate G5 — storefront catalog connect). Honest, always-visible
// indicator for the two non-"ok" states returned by
// lib/catalog/storefront.ts's getStorefrontCatalog(). Never rendered for
// "ok". This is the mechanism that satisfies the mission requirement: the
// site must never silently serve stale or unavailable catalog data — if the
// live fetch failed, the visitor is told so, in plain Spanish, every time.
import { buildGenericWhatsAppHref } from "@/lib/whatsapp";
import { WhatsAppCTA } from "@/components/layout/WhatsAppCTA";

function relativeAge(fetchedAt: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - fetchedAt) / 60000));
  if (minutes < 1) return "hace un momento";
  if (minutes === 1) return "hace 1 minuto";
  if (minutes < 60) return `hace ${minutes} minutos`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
}

export function CatalogStatusBanner({
  status,
  fetchedAt,
  className = "",
}: {
  status: "stale" | "unavailable";
  fetchedAt?: number | null;
  className?: string;
}) {
  if (status === "stale") {
    return (
      <div
        role="status"
        className={`rounded-md border border-dashed border-barro bg-crudo/40 px-4 py-3 text-sm text-text-muted ${className}`}
      >
        <span className="font-medium text-barro-hondo">⟨Catálogo en actualización⟩</span>{" "}
        No pudimos conectar con el servidor en este momento. Estás viendo la última
        versión guardada{fetchedAt ? ` (${relativeAge(fetchedAt)})` : ""}. Estamos
        intentando actualizarla automáticamente.
      </div>
    );
  }

  const href = buildGenericWhatsAppHref();
  return (
    <div
      role="status"
      className={`rounded-md border border-dashed border-barro bg-crudo/40 px-4 py-6 text-center text-sm text-text-muted ${className}`}
    >
      <p className="font-medium text-barro-hondo">⟨Catálogo no disponible⟩</p>
      <p className="mx-auto mt-2 max-w-md">
        No pudimos cargar el catálogo en este momento. Inténtalo de nuevo en unos
        minutos, o escríbenos por WhatsApp y con gusto te ayudamos.
      </p>
      <div className="mt-4 flex justify-center">
        <WhatsAppCTA href={href ?? undefined} label="Escríbenos por WhatsApp" />
      </div>
    </div>
  );
}
