export type LineItem = { label: string; quantity: string; detail: string };

export function parseLineItemsJson(json: string): LineItem[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}
