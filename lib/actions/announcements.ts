"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireUser, MANAGER_ROLES } from "@/lib/auth";
import { translateText } from "@/lib/translate";
import { sendLocalizedPushToUsers } from "@/lib/push";
import { parseMentions } from "@/lib/mentions";

const announcementSchema = z.object({
  message: z.string().trim().min(1, "Write something first.").max(1000),
  sourceLang: z.enum(["EN", "ES"]),
});

export type AnnouncementFormState = { error?: string };

export async function createAnnouncementAction(
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const user = await requireRole(MANAGER_ROLES);

  const parsed = announcementSchema.safeParse({
    message: formData.get("message"),
    sourceLang: formData.get("sourceLang"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { message, sourceLang } = parsed.data;
  const targetLang = sourceLang === "EN" ? "ES" : "EN";
  const tMessage = await translateText(message, sourceLang, targetLang);
  const translated = tMessage !== null;

  const messageEn = sourceLang === "EN" ? message : (tMessage ?? message);
  const messageEs = sourceLang === "EN" ? (tMessage ?? message) : message;

  const activeUsers = await db.user.findMany({
    where: { active: true },
    select: { id: true, name: true },
  });
  const mentionedUserIds = parseMentions(message, activeUsers).filter((id) => id !== user.id);

  await db.announcement.create({
    data: {
      sourceLang,
      messageEn,
      messageEs,
      translated,
      authorId: user.id,
      mentionedUserIds: JSON.stringify(mentionedUserIds),
    },
  });

  sendLocalizedPushToUsers("all", {
    EN: {
      title: `Announcement from ${user.name}`,
      body: messageEn,
      url: "/announcements",
    },
    ES: {
      title: `Anuncio de ${user.name}`,
      body: messageEs,
      url: "/announcements",
    },
  }).catch(() => {});

  if (mentionedUserIds.length > 0) {
    sendLocalizedPushToUsers(mentionedUserIds, {
      EN: {
        title: `${user.name} mentioned you`,
        body: messageEn,
        url: "/announcements",
      },
      ES: {
        title: `${user.name} te mencionó`,
        body: messageEs,
        url: "/announcements",
      },
    }).catch(() => {});
  }

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/display");
  return {};
}

export async function editAnnouncementAction(
  announcementId: string,
  _prevState: AnnouncementFormState,
  formData: FormData
): Promise<AnnouncementFormState> {
  const user = await requireUser();

  const existing = await db.announcement.findUnique({ where: { id: announcementId } });
  if (!existing) return { error: "Announcement not found." };
  if (existing.authorId !== user.id && !MANAGER_ROLES.includes(user.role)) {
    return { error: "You can't edit this announcement." };
  }

  const parsed = announcementSchema.safeParse({
    message: formData.get("message"),
    sourceLang: formData.get("sourceLang"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { message, sourceLang } = parsed.data;
  const targetLang = sourceLang === "EN" ? "ES" : "EN";
  const tMessage = await translateText(message, sourceLang, targetLang);
  const translated = tMessage !== null;

  const messageEn = sourceLang === "EN" ? message : (tMessage ?? message);
  const messageEs = sourceLang === "EN" ? (tMessage ?? message) : message;

  const activeUsers = await db.user.findMany({
    where: { active: true },
    select: { id: true, name: true },
  });
  const mentionedUserIds = parseMentions(message, activeUsers).filter((id) => id !== existing.authorId);

  await db.announcement.update({
    where: { id: announcementId },
    data: {
      sourceLang,
      messageEn,
      messageEs,
      translated,
      mentionedUserIds: JSON.stringify(mentionedUserIds),
      editedAt: new Date(),
    },
  });

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/display");
  return {};
}
