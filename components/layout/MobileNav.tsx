// components/layout/MobileNav.tsx — AMARILLO. Accessible mobile drawer:
// focus trap, Escape-to-close, focus restoration to the trigger, body scroll
// lock, closes on navigation. Client component (the shell's only other
// interactive piece besides Reveal).
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
      if (event.shiftKey && active === first) {
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

      {open ? (
        <div className="fixed inset-0 z-50">
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
            className="absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col gap-2 border-l border-hairline bg-marfil p-6 shadow-lg motion-safe:animate-[amarillo-rise_var(--duration-base)_var(--ease-entrance)_both]"
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
                  key={item.href}
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
        </div>
      ) : null}
    </div>
  );
}
