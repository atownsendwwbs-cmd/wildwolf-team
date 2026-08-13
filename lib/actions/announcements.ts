"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { sendPushToUsers } from "@/lib/push";

const announcementSchema = z.object({
  message: z.string().trim().min(1, "Write something first.").max(1000),
});

export type AnnouncementFormState = { error?: string };

export async function createAnnouncementAction(
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const user = await requireRole(MANAGER_ROLES);

  const parsed = announcementSchema.safeParse({ message: formData.get("message") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.announcement.create({
    data: { message: parsed.data.message, authorId: user.id },
  });

  sendPushToUsers("all", {
    title: `Announcement from ${user.name}`,
    body: parsed.data.message,
    url: "/announcements",
  }).catch(() => {});

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/display");
  return {};
}
