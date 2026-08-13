"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { ReactionTarget } from "@/lib/generated/prisma/enums";

const REVALIDATE_PATHS: Record<ReactionTarget, string[]> = {
  ANNOUNCEMENT: ["/announcements", "/", "/display"],
  BRIEF: ["/brief", "/"],
  TASK: ["/tasks", "/"],
};

export async function toggleReactionAction(
  messageType: ReactionTarget,
  messageId: string,
  emoji: string
) {
  const user = await requireUser();

  const existing = await db.reaction.findUnique({
    where: {
      messageType_messageId_userId_emoji: { messageType, messageId, userId: user.id, emoji },
    },
  });

  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
  } else {
    await db.reaction.create({ data: { messageType, messageId, userId: user.id, emoji } });
  }

  for (const path of REVALIDATE_PATHS[messageType]) {
    revalidatePath(path);
  }
}
