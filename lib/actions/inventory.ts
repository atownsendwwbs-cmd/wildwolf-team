"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, requireRole, MANAGER_ROLES } from "@/lib/auth";

const alertSchema = z.object({
  category: z.enum(["FINISHED_GOOD", "RAW_MATERIAL", "SUPPLY"]),
  itemName: z.string().trim().min(1, "Item name is required").max(200),
  urgency: z.enum(["LOW", "MEDIUM", "HIGH"]),
  notes: z.string().trim().max(2000).optional(),
});

export type AlertFormState = { error?: string };

export async function createAlertAction(
  _prevState: AlertFormState,
  formData: FormData
): Promise<AlertFormState> {
  const user = await requireUser();

  const parsed = alertSchema.safeParse({
    category: formData.get("category"),
    itemName: formData.get("itemName"),
    urgency: formData.get("urgency"),
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.inventoryAlert.create({
    data: {
      category: parsed.data.category,
      itemName: parsed.data.itemName,
      urgency: parsed.data.urgency,
      notes: parsed.data.notes,
      reportedById: user.id,
    },
  });

  revalidatePath("/inventory");
  revalidatePath("/");
  redirect("/inventory");
}

export async function resolveAlertAction(alertId: string) {
  const user = await requireRole(MANAGER_ROLES);

  await db.inventoryAlert.update({
    where: { id: alertId },
    data: { status: "RESOLVED", resolvedById: user.id, resolvedAt: new Date() },
  });

  revalidatePath("/inventory");
  revalidatePath("/");
}

export async function reopenAlertAction(alertId: string) {
  await requireRole(MANAGER_ROLES);

  await db.inventoryAlert.update({
    where: { id: alertId },
    data: { status: "OPEN", resolvedById: null, resolvedAt: null },
  });

  revalidatePath("/inventory");
  revalidatePath("/");
}
