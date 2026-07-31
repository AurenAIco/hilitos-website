// components/layout/MobileNav.tsx — AMARILLO. Accessible mobile drawer:
// focus trap, Escape-to-close, focus restoration to the trigger, body scroll
// lock, closes on navigation. Client component (the shell's only other
// interactive piece besides Reveal).
//
// S5: the open overlay is rendered via a portal to document.body rather than
// as a normal DOM child. Header (the trigger's ancestor) sets
// `backdrop-blur-sm`, which — like `filter`/`transform` — establishes a CSS
// containing block for `position: fixed` descendants (spec:
// https://drafts.fxtf.org/filter-effects-2/#BackdropFilterProperty). Left
// in-tree, the drawer's `fixed inset-0` overlay would resolve against
// Header's ~64px box instead of the viewport, shrinking the scrim and
// letting background links stay clickable underneath it. Portaling to
// document.body escapes that containing block while keeping the overlay
// inside MobileNav's React tree (state, context, and event bubbling to
// React ancestors are unaffected by the portal). Safe from hydration
// mismatches because `open` starts false: the overlay branch never renders
// during SSR or the initial client render, only after a later user-driven
// state update, so `document.body` is never touched before mount.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { NAV_ITEMS } from "./nav-items";
import { WhatsAppCTA } from "./WhatsAppCTA";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
    focusables[0]?.focus();

    // If the viewport grows to the desktop breakpoint while the drawer is open,
    // the md:hidden wrapper disappears via CSS but `open` would stay true and the
    // body scroll lock would leak. Close through the canonical close() so state,
    // scroll lock (restored by this effect's cleanup) and focus are all handled.
    const desktopMq = window.matchMedia("(min-width: 768px)");
    function onDesktopChange(event: MediaQueryListEvent) {
      if (event.matches) close();
    }
    desktopMq.addEventListener("change", onDesktopChange);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;
      const items = panel!.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      // If focus has escaped the panel (e.g. a click on a non-focusable area
      // moved it to <body>), pull it back in rather than letting Tab reach the
      // background behind the dialog.
      if (!panel!.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktopMq.removeEventListener("change", onDesktopChange);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => (open ? close() : setOpen(true))}
        className="grid size-11 place-items-center rounded-md text-tinta hover:bg-crudo/60"
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6" fill="none">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 md:hidden">
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={close}
                className="absolute inset-0 cursor-default bg-tinta/30"
              />
              <div
                ref={panelRef}
                id="menu-movil"
                role="dialog"
                aria-modal="true"
                aria-label="Menú"
                className="absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col gap-2 overflow-y-auto border-l border-hairline bg-marfil p-6 shadow-lg motion-safe:animate-[amarillo-rise_var(--duration-base)_var(--ease-entrance)_both]"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-display text-xl text-tinta">Hilitos</span>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Cerrar menú"
                    className="grid size-11 place-items-center rounded-md text-tinta hover:bg-crudo/60"
                  >
                    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-6" fill="none">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <nav aria-label="Principal (móvil)" className="flex flex-col">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={close}
                      className="border-b border-hairline py-3.5 text-lg text-tinta hover:text-barro-hondo"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-4">
                  <WhatsAppCTA className="w-full" />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
