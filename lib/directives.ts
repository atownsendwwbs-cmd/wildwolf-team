import type { DirectiveModel } from "./generated/prisma/models";

export type DirectiveGroup = { section: string | null; items: DirectiveModel[] };

// Groups a user's directives by their optional section label, ordered by
// each group's earliest sortOrder (so groups stay in roughly the order
// they were first introduced), with items inside each group sorted by
// their own sortOrder. Directives are expected to already be pre-sorted
// by sortOrder ascending -- this only clusters them, it doesn't re-sort.
export function groupDirectives(directives: DirectiveModel[]): DirectiveGroup[] {
  const groups = new Map<string | null, DirectiveModel[]>();
  for (const d of directives) {
    const key = d.section ?? null;
    const list = groups.get(key);
    if (list) list.push(d);
    else groups.set(key, [d]);
  }
  return [...groups.entries()]
    .map(([section, items]) => ({ section, items }))
    .sort((a, b) => a.items[0].sortOrder - b.items[0].sortOrder);
}
