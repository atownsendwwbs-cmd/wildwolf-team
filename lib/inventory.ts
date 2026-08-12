export const BOX_SIZES: { value: string; label: string }[] = [
  { value: "SIZE_8X6X6", label: "8x6x6" },
  { value: "SIZE_12X12X12", label: "12x12x12" },
  { value: "SIZE_14X9X9", label: "14x9x9" },
  { value: "SIZE_14X12X10", label: "14x12x10" },
  { value: "SIZE_15X15X15", label: "15x15x15" },
  { value: "SIZE_16X12X12", label: "16x12x12" },
  { value: "SIZE_24X16X16", label: "24x16x16" },
  { value: "SIZE_36X12X16", label: "36x12x16" },
  { value: "SIZE_24X20X20", label: "24x20x20" },
  { value: "SIZE_24X16X12", label: "24x16x12" },
];

export const BOX_SIZE_LABELS: Record<string, string> = Object.fromEntries(
  BOX_SIZES.map((s) => [s.value, s.label])
);

export const STOCK_LEVEL_LABELS: Record<string, string> = {
  UNDER_100: "Under 100 units",
  UNDER_50: "Under 50 units",
  UNDER_25: "Under 25 units",
  OUT_OF_STOCK: "Out of stock",
};

export const RAW_MATERIAL_STATUS_LABELS: Record<string, string> = {
  OUT: "Out of material",
  LOW: "Low — more to pack",
};

// Items in the SUPPLY category that need an exact size captured
export const BOXES_ITEM_NAME = "Boxes";
export const SIZED_SUPPLY_ITEMS = ["Buckets", "Bucket lids", "Poly bags", "Clear bags"];

export function isCriticalAlert(alert: {
  category: string;
  urgency: string | null;
  stockLevel: string | null;
  rawMaterialStatus: string | null;
}) {
  if (alert.category === "SUPPLY") return alert.urgency === "HIGH";
  if (alert.category === "FINISHED_GOOD") return alert.stockLevel === "OUT_OF_STOCK";
  if (alert.category === "RAW_MATERIAL") return alert.rawMaterialStatus === "OUT";
  return false;
}
