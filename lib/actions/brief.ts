"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";

const briefSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Brief content is required").max(10000),
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
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.dailyBrief.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      authorId: user.id,
    },
  });

  revalidatePath("/brief");
  revalidatePath("/");
  redirect("/brief");
}
