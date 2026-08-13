"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, requireRole, MANAGER_ROLES } from "@/lib/auth";
import { BOX_SIZES, BOXES_ITEM_NAME, SIZED_SUPPLY_ITEMS } from "@/lib/inventory";
import { notifyManagers } from "@/lib/push";
import type { BoxSize } from "@/lib/generated/prisma/enums";

const CATEGORY_LABEL = {
  EN: { FINISHED_GOOD: "finished good", RAW_MATERIAL: "raw material", SUPPLY: "supply" },
  ES: { FINISHED_GOOD: "producto terminado", RAW_MATERIAL: "materia prima", SUPPLY: "insumo" },
} as const;

const boxSizeValues = BOX_SIZES.map((s) => s.value) as [string, ...string[]];

const alertSchema = z
  .object({
    category: z.enum(["FINISHED_GOOD", "RAW_MATERIAL", "SUPPLY"]),
    itemName: z.string().trim().min(1, "Item name is required").max(200),
    notes: z.string().trim().max(2000).optional(),
    urgency: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    stockLevel: z.enum(["UNDER_100", "UNDER_50", "UNDER_25", "OUT_OF_STOCK"]).optional(),
    rawMaterialStatus: z.enum(["OUT", "LOW"]).optional(),
    quantity: z.string().trim().max(200).optional(),
    boxSize: z.enum(boxSizeValues).optional(),
    supplySize: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "FINISHED_GOOD" && !data.stockLevel) {
      ctx.addIssue({ code: "custom", message: "Select a stock level.", path: ["stockLevel"] });
    }
    if (data.category === "RAW_MATERIAL") {
      if (!data.rawMaterialStatus) {
        ctx.addIssue({ code: "custom", message: "Select out or low.", path: ["rawMaterialStatus"] });
      }
      if (!data.quantity?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Enter the amount left (bags, boxes, pallets, or weight).",
          path: ["quantity"],
        });
      }
    }
    if (data.category === "SUPPLY") {
      if (!data.urgency) {
        ctx.addIssue({ code: "custom", message: "Select urgency.", path: ["urgency"] });
      }
      if (data.itemName === BOXES_ITEM_NAME && !data.boxSize) {
        ctx.addIssue({ code: "custom", message: "Select a box size.", path: ["boxSize"] });
      }
      if (SIZED_SUPPLY_ITEMS.includes(data.itemName) && !data.supplySize?.trim()) {
        ctx.addIssue({ code: "custom", message: "Enter a size.", path: ["supplySize"] });
      }
    }
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
    notes: formData.get("notes") || undefined,
    urgency: formData.get("urgency") || undefined,
    stockLevel: formData.get("stockLevel") || undefined,
    rawMaterialStatus: formData.get("rawMaterialStatus") || undefined,
    quantity: formData.get("quantity") || undefined,
    boxSize: formData.get("boxSize") || undefined,
    supplySize: formData.get("supplySize") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { category, itemName, notes } = parsed.data;

  await db.inventoryAlert.create({
    data: {
      category,
      itemName,
      notes,
      reportedById: user.id,
      urgency: category === "SUPPLY" ? parsed.data.urgency : undefined,
      boxSize:
        category === "SUPPLY" && itemName === BOXES_ITEM_NAME
          ? (parsed.data.boxSize as BoxSize | undefined)
          : undefined,
      supplySize:
        category === "SUPPLY" && SIZED_SUPPLY_ITEMS.includes(itemName) ? parsed.data.supplySize : undefined,
      stockLevel: category === "FINISHED_GOOD" ? parsed.data.stockLevel : undefined,
      rawMaterialStatus: category === "RAW_MATERIAL" ? parsed.data.rawMaterialStatus : undefined,
      quantity: category === "RAW_MATERIAL" ? parsed.data.quantity : undefined,
    },
  });

  notifyManagers(user.id, {
    EN: {
      title: `Low ${CATEGORY_LABEL.EN[category]} reported`,
      body: `${itemName} — reported by ${user.name}`,
      url: "/inventory",
    },
    ES: {
      title: `${CATEGORY_LABEL.ES[category]} bajo reportado`,
      body: `${itemName} — reportado por ${user.name}`,
      url: "/inventory",
    },
  }).catch(() => {});

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
