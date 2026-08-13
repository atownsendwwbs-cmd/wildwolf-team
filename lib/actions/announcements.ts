"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { translateText } from "@/lib/translate";
import { sendLocalizedPushToUsers } from "@/lib/push";

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

  await db.announcement.create({
    data: { sourceLang, messageEn, messageEs, translated, authorId: user.id },
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

  revalidatePath("/announcements");
  revalidatePath("/");
  revalidatePath("/display");
  return {};
}
