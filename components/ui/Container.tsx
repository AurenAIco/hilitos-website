// components/ui/Container.tsx — AMARILLO. Public-page container primitive.
import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-page px-[var(--container-gutter)] ${className}`}>
      {children}
    </div>
  );
}
