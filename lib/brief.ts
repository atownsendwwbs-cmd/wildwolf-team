export type ChannelKey = "tiktok" | "amazon" | "faire" | "whatnot" | "other";

export type ProductionByChannel = Record<ChannelKey, string>;

export const SALES_CHANNELS: { key: ChannelKey; label: string }[] = [
  { key: "tiktok", label: "TikTok" },
  { key: "amazon", label: "Amazon" },
  { key: "faire", label: "Faire / Retail" },
  { key: "whatnot", label: "WhatNot" },
  { key: "other", label: "Other" },
];

export const EMPTY_PRODUCTION: ProductionByChannel = {
  tiktok: "",
  amazon: "",
  faire: "",
  whatnot: "",
  other: "",
};

export function parseProduction(json: string): ProductionByChannel {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return EMPTY_PRODUCTION;
    return { ...EMPTY_PRODUCTION, ...parsed };
  } catch {
    return EMPTY_PRODUCTION;
  }
}
