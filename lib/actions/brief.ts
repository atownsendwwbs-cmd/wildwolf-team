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

export async function createBriefAction(
  _prevState: BriefFormState,
  formData: FormData
): Promise<BriefFormState> {
  const user = await requireRole(MANAGER_ROLES);

  const parsed = briefSchema.safeParse({
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

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { title, sourceLang, intro, packing, special } = parsed.data;
  const production: ProductionByChannel = {
    tiktok: parsed.data.productionTiktok,
    amazon: parsed.data.productionAmazon,
    faire: parsed.data.productionFaire,
    whatnot: parsed.data.productionWhatnot,
    other: parsed.data.productionOther,
  };
  const targetLang = sourceLang === "EN" ? "ES" : "EN";

  const [
    tTitle,
    tIntro,
    tPacking,
    tSpecial,
    ...tChannels
  ] = await Promise.all([
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
  const titleEn = en ? title : (tTitle ?? title);
  const titleEs = en ? (tTitle ?? title) : title;
  const introEn = en ? intro : (tIntro ?? intro);
  const introEs = en ? (tIntro ?? intro) : intro;
  const packingEn = en ? packing : (tPacking ?? packing);
  const packingEs = en ? (tPacking ?? packing) : packing;
  const specialEn = en ? special : (tSpecial ?? special);
  const specialEs = en ? (tSpecial ?? special) : special;
  const productionEn = en ? production : translatedProduction;
  const productionEs = en ? translatedProduction : production;

  await db.dailyBrief.create({
    data: {
      sourceLang,
      titleEn,
      titleEs,
      introEn,
      introEs,
      productionEn: JSON.stringify(productionEn),
      productionEs: JSON.stringify(productionEs),
      packingEn,
      packingEs,
      specialEn,
      specialEs,
      translated,
      authorId: user.id,
    },
  });

  revalidatePath("/brief");
  revalidatePath("/");
  redirect("/brief");
}
