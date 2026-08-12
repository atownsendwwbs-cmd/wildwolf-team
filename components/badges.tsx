import { STOCK_LEVEL_LABELS, RAW_MATERIAL_STATUS_LABELS } from "@/lib/inventory";

const CATEGORY_LABELS: Record<string, string> = {
  FINISHED_GOOD: "Finished good",
  RAW_MATERIAL: "Raw material",
  SUPPLY: "Warehouse supply",
};

const URGENCY_STYLES: Record<string, string> = {
  LOW: "bg-neutral-800 text-neutral-300 border-neutral-700",
  MEDIUM: "bg-amber-950/50 text-amber-300 border-amber-800",
  HIGH: "bg-red-950/50 text-red-300 border-red-800",
};

const STOCK_LEVEL_STYLES: Record<string, string> = {
  UNDER_100: "bg-neutral-800 text-neutral-300 border-neutral-700",
  UNDER_50: "bg-amber-950/50 text-amber-300 border-amber-800",
  UNDER_25: "bg-orange-950/50 text-orange-300 border-orange-800",
  OUT_OF_STOCK: "bg-red-950/50 text-red-300 border-red-800",
};

const RAW_MATERIAL_STATUS_STYLES: Record<string, string> = {
  LOW: "bg-amber-950/50 text-amber-300 border-amber-800",
  OUT: "bg-red-950/50 text-red-300 border-red-800",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-0.5 text-xs text-neutral-300">
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
        URGENCY_STYLES[urgency] ?? URGENCY_STYLES.LOW
      }`}
    >
      {urgency}
    </span>
  );
}

export function StockLevelBadge({ stockLevel }: { stockLevel: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${
        STOCK_LEVEL_STYLES[stockLevel] ?? STOCK_LEVEL_STYLES.UNDER_100
      }`}
    >
      {STOCK_LEVEL_LABELS[stockLevel] ?? stockLevel}
    </span>
  );
}

export function RawMaterialStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${
        RAW_MATERIAL_STATUS_STYLES[status] ?? RAW_MATERIAL_STATUS_STYLES.LOW
      }`}
    >
      {RAW_MATERIAL_STATUS_LABELS[status] ?? status}
    </span>
  );
}
