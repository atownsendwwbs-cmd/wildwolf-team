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

export type ParsedDirective = { section: string | null; text: string };

// Parses a pasted block of text into (section, item) pairs. Matches the
// exact shape these lists naturally get written in -- and the exact shape
// Claude formats them in when handing one back for approval:
//
//   Section: Morning Tasks
//   1. First thing to do...
//   2. Second thing...
//
//   Section: Reporting
//   3. Report anything low...
//
// A "Section: X" line (bold markdown or plain) sets the current section
// for everything under it until the next one. Numbered (1., 2)) or
// bulleted (-, *) lines become individual directives. Anything else
// (blank lines, titles, stray prose) is ignored rather than erroring.
export function parseDirectiveBlock(raw: string): ParsedDirective[] {
  const items: ParsedDirective[] = [];
  let currentSection: string | null = null;

  for (const rawLine of raw.split("\n")) {
    const line = rawLine.trim().replace(/^\*\*|\*\*$/g, "").trim();
    if (!line) continue;

    const sectionMatch = line.match(/^section:\s*(.+)$/i);
    if (sectionMatch) {
      const label = sectionMatch[1].trim().replace(/^\*\*|\*\*$/g, "").trim();
      currentSection = label ? label.slice(0, 60) : null;
      continue;
    }

    const listMatch = line.match(/^(?:\d+[.)]|[-*])\s+(.+)$/);
    const itemText = listMatch?.[1]?.trim();
    if (itemText) {
      items.push({ section: currentSection, text: itemText.slice(0, 500) });
    }
  }

  return items;
}
