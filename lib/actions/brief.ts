"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { translateText } from "@/lib/translate";

const briefSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Brief content is required").max(10000),
  sourceLang: z.enum(["EN", "ES"]),
});

export type BriefFormState = { error?: string };

export async function createBriefAction(
  _prevState: BriefFormState,
  formData: FormData
): Promise<BriefFormState> {
  const user = await requireRole(MANAGER_ROLES);

  const parsed = briefSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    sourceLang: formData.get("sourceLang"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { title, content, sourceLang } = parsed.data;
  const targetLang = sourceLang === "EN" ? "ES" : "EN";

  const [translatedTitle, translatedContent] = await Promise.all([
    translateText(title, sourceLang, targetLang),
    translateText(content, sourceLang, targetLang),
  ]);

  const translated = translatedTitle !== null && translatedContent !== null;

  const titleEn = sourceLang === "EN" ? title : (translatedTitle ?? title);
  const contentEn = sourceLang === "EN" ? content : (translatedContent ?? content);
  const titleEs = sourceLang === "ES" ? title : (translatedTitle ?? title);
  const contentEs = sourceLang === "ES" ? content : (translatedContent ?? content);

  await db.dailyBrief.create({
    data: {
      sourceLang,
      titleEn,
      contentEn,
      titleEs,
      contentEs,
      translated,
      authorId: user.id,
    },
  });

  revalidatePath("/brief");
  revalidatePath("/");
  redirect("/brief");
}
