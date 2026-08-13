"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { translateText } from "@/lib/translate";
import { SALES_CHANNELS, type ProductionByChannel } from "@/lib/brief";

const sectionText = z.string().trim().max(4000).optional().default("");

const briefSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  sourceLang: z.enum(["EN", "ES"]),
  intro: sectionText,
  productionTiktok: sectionText,
  productionAmazon: sectionText,
  productionFaire: sectionText,
  productionWhatnot: sectionText,
  productionOther: sectionText,
  packing: sectionText,
  special: sectionText,
});

export type BriefFormState = { error?: string };

async function translateSection(text: string, from: "EN" | "ES", to: "EN" | "ES") {
  return translateText(text, from, to);
}

function parseBriefForm(formData: FormData) {
  return briefSchema.safeParse({
    title: formData.get("title"),
    sourceLang: formData.get("sourceLang"),
    intro: formData.get("intro"),
    productionTiktok: formData.get("productionTiktok"),
    productionAmazon: formData.get("productionAmazon"),
    productionFaire: formData.get("productionFaire"),
    productionWhatnot: formData.get("productionWhatnot"),
    productionOther: formData.get("productionOther"),
    packing: formData.get("packing"),
    special: formData.get("special"),
  });
}

async function buildBriefFields(parsed: z.infer<typeof briefSchema>) {
  const { title, sourceLang, intro, packing, special } = parsed;
  const production: ProductionByChannel = {
    tiktok: parsed.productionTiktok,
    amazon: parsed.productionAmazon,
    faire: parsed.productionFaire,
    whatnot: parsed.productionWhatnot,
    other: parsed.productionOther,
  };
  const targetLang = sourceLang === "EN" ? "ES" : "EN";

  const [tTitle, tIntro, tPacking, tSpecial, ...tChannels] = await Promise.all([
    translateSection(title, sourceLang, targetLang),
    translateSection(intro, sourceLang, targetLang),
    translateSection(packing, sourceLang, targetLang),
    translateSection(special, sourceLang, targetLang),
    ...SALES_CHANNELS.map((c) => translateSection(production[c.key], sourceLang, targetLang)),
  ]);

  const translatedProduction: ProductionByChannel = { ...production };
  let productionTranslated = true;
  SALES_CHANNELS.forEach((c, i) => {
    const result = tChannels[i];
    if (result === null) {
      productionTranslated = false;
    } else {
      translatedProduction[c.key] = result;
    }
  });

  const translated =
    tTitle !== null && tIntro !== null && tPacking !== null && tSpecial !== null && productionTranslated;

  const en = sourceLang === "EN";
  return {
    sourceLang,
    titleEn: en ? title : (tTitle ?? title),
    titleEs: en ? (tTitle ?? title) : title,
    introEn: en ? intro : (tIntro ?? intro),
    introEs: en ? (tIntro ?? intro) : intro,
    packingEn: en ? packing : (tPacking ?? packing),
    packingEs: en ? (tPacking ?? packing) : packing,
    specialEn: en ? special : (tSpecial ?? special),
    specialEs: en ? (tSpecial ?? special) : special,
    productionEn: JSON.stringify(en ? production : translatedProduction),
    productionEs: JSON.stringify(en ? translatedProduction : production),
    translated,
  };
}

export async function createBriefAction(
  _prevState: BriefFormState,
  formData: FormData
): Promise<BriefFormState> {
  const user = await requireRole(MANAGER_ROLES);

  const parsed = parseBriefForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const fields = await buildBriefFields(parsed.data);

  await db.dailyBrief.create({
    data: { ...fields, authorId: user.id },
  });

  revalidatePath("/brief");
  revalidatePath("/");
  redirect("/brief");
}

export async function editBriefAction(
  briefId: string,
  _prevState: BriefFormState,
  formData: FormData
): Promise<BriefFormState> {
  const user = await requireRole(MANAGER_ROLES);

  const existing = await db.dailyBrief.findUnique({ where: { id: briefId } });
  if (!existing) return { error: "Brief not found." };
  if (existing.authorId !== user.id && !MANAGER_ROLES.includes(user.role)) {
    return { error: "You can't edit this brief." };
  }

  const parsed = parseBriefForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const fields = await buildBriefFields(parsed.data);

  await db.dailyBrief.update({
    where: { id: briefId },
    data: { ...fields, editedAt: new Date() },
  });

  revalidatePath("/brief");
  revalidatePath(`/brief/${briefId}`);
  revalidatePath("/");
  redirect(`/brief/${briefId}`);
}
