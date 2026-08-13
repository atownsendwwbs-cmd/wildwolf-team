"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notifyManagers } from "@/lib/push";

const lineItemSchema = z.object({
  label: z.string().trim().min(1).max(200),
  quantity: z.string().trim().max(50).optional().default(""),
  detail: z.string().trim().max(500).optional().default(""),
});

const eodSchema = z.object({
  packedItems: z.array(lineItemSchema).max(100).default([]),
  sortedOutItems: z.array(lineItemSchema).max(100).default([]),
  notes: z.string().trim().max(5000).optional(),
  leftOff: z.string().trim().max(2000).optional(),
});

export type EodFormState = { error?: string };

function parseLineItems(formData: FormData, prefix: string) {
  const labels = formData.getAll(`${prefix}_label`);
  const quantities = formData.getAll(`${prefix}_quantity`);
  const details = formData.getAll(`${prefix}_detail`);

  const items = labels.map((label, i) => ({
    label: String(label ?? ""),
    quantity: String(quantities[i] ?? ""),
    detail: String(details[i] ?? ""),
  }));

  return items.filter((item) => item.label.trim().length > 0);
}

export async function createEodReportAction(
  _prevState: EodFormState,
  formData: FormData
): Promise<EodFormState> {
  const user = await requireUser();

  const parsed = eodSchema.safeParse({
    packedItems: parseLineItems(formData, "packed"),
    sortedOutItems: parseLineItems(formData, "sorted"),
    notes: formData.get("notes") || undefined,
    leftOff: formData.get("leftOff") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.packedItems.length === 0 && parsed.data.sortedOutItems.length === 0 && !parsed.data.notes) {
    return { error: "Add at least one packed item, sorted item, or a note before submitting." };
  }

  await db.endOfDayReport.create({
    data: {
      authorId: user.id,
      packedItems: JSON.stringify(parsed.data.packedItems),
      sortedOutItems: JSON.stringify(parsed.data.sortedOutItems),
      notes: parsed.data.notes,
      leftOff: parsed.data.leftOff,
    },
  });

  notifyManagers(user.id, {
    EN: {
      title: "End-of-day report submitted",
      body: `${user.name} just submitted their end-of-day report`,
      url: "/eod",
    },
    ES: {
      title: "Reporte de fin de día enviado",
      body: `${user.name} acaba de enviar su reporte de fin de día`,
      url: "/eod",
    },
  }).catch(() => {});

  revalidatePath("/eod");
  revalidatePath("/");
  redirect("/eod");
}
