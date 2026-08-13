import "server-only";
import { db } from "./db";
import type { ReactionTarget } from "./generated/prisma/enums";

export type ReactionSummary = { emoji: string; count: number; reacted: boolean };

// Fetches every reaction for a batch of messages at once and groups them
// per message, per emoji — so a list page only needs one query instead of
// one per item.
export async function getReactionSummaries(
  messageType: ReactionTarget,
  messageIds: string[],
  currentUserId: string | null
): Promise<Record<string, ReactionSummary[]>> {
  if (messageIds.length === 0) return {};

  const rows = await db.reaction.findMany({
    where: { messageType, messageId: { in: messageIds } },
  });

  const byMessage: Record<string, Map<string, ReactionSummary>> = {};
  for (const row of rows) {
    const forMessage = (byMessage[row.messageId] ??= new Map());
    const entry = forMessage.get(row.emoji) ?? { emoji: row.emoji, count: 0, reacted: false };
    entry.count += 1;
    if (currentUserId && row.userId === currentUserId) entry.reacted = true;
    forMessage.set(row.emoji, entry);
  }

  const result: Record<string, ReactionSummary[]> = {};
  for (const [messageId, map] of Object.entries(byMessage)) {
    result[messageId] = [...map.values()];
  }
  return result;
}
