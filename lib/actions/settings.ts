"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { Lang } from "@/lib/generated/prisma/enums";

export async function setPreferredLangAction(lang: Lang) {
  const user = await requireUser();

  await db.user.update({ where: { id: user.id }, data: { preferredLang: lang } });

  revalidatePath("/");
  revalidatePath("/brief");
  revalidatePath("/announcements");
}
