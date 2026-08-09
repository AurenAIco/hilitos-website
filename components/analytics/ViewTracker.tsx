// components/analytics/ViewTracker.tsx — invisible client leaf that fires
// one page-view analytics event on mount. Lets Server Component routes
// (app/(public)/catalogo, colecciones/[slug], productos/[slug]) report a
// view without becoming Client Components themselves — this is the same
// "Server Component renders a small client leaf with serializable props"
// pattern already used for interactivity elsewhere in this app (e.g.
// MobileNav, VariantSelector). Renders nothing.
"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

export function ViewTracker({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
    // Intentionally fire once per mount only — a route change remounts this
    // component (new React key via the route tree), which is exactly one
    // view per navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
