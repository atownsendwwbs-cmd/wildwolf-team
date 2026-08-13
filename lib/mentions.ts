import "server-only";

export type MentionCandidate = { id: string; name: string };

// Finds every "@Name" in free text and matches it against known active
// team members — by full name ("@Alec Townsend") or just their first word
// ("@Alec") — and returns the matched user ids, deduped. Longest name
// wins first so "@Alec Townsend" doesn't only match "Alec".
export function parseMentions(text: string, users: MentionCandidate[]): string[] {
  const candidates = users
    .flatMap((u) => {
      const first = u.name.trim().split(/\s+/)[0];
      const names = new Set([u.name.trim(), first]);
      return [...names].map((name) => ({ id: u.id, name }));
    })
    .sort((a, b) => b.name.length - a.name.length);

  const matched = new Set<string>();
  const atPositions = [...text.matchAll(/@/g)].map((m) => m.index);

  for (const pos of atPositions) {
    const rest = text.slice(pos + 1);
    for (const candidate of candidates) {
      if (rest.toLowerCase().startsWith(candidate.name.toLowerCase())) {
        const nextChar = rest[candidate.name.length];
        if (!nextChar || !/[a-zA-Z0-9]/.test(nextChar)) {
          matched.add(candidate.id);
          break;
        }
      }
    }
  }

  return [...matched];
}
