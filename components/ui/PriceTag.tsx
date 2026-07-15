// components/ui/PriceTag.tsx — AMARILLO. Price display per the frozen contract:
// prefer priceLabel; else format integer COP (es-CO); both absent →
// "Precio a consultar". NEVER renders $0 (0-as-unknown is defensively mapped
// to the consult fallback; the fixture-lint already forbids price: 0).
import type { ProductContract } from "@/lib/contract";

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function PriceTag({
  price,
  priceLabel,
  className = "",
}: Pick<ProductContract, "price" | "priceLabel"> & { className?: string }) {
  const label =
    priceLabel && priceLabel.length > 0
      ? priceLabel
      : price !== null && price > 0
        ? COP.format(price)
        : "Precio a consultar";
  return <p className={`text-sm font-medium text-tinta ${className}`}>{label}</p>;
}
