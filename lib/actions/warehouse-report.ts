"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notifyManagers } from "@/lib/push";

const warehouseReportSchema = z.object({
  shipments: z.string().trim().max(3000).optional(),
  rackChanges: z.string().trim().max(3000).optional(),
  cleaning: z.string().trim().max(3000).optional(),
  notes: z.string().trim().max(3000).optional(),
});

export type WarehouseReportFormState = { error?: string };

export async function createWarehouseReportAction(
  _prevState: WarehouseReportFormState,
  formData: FormData
): Promise<WarehouseReportFormState> {
  const user = await requireUser();

  const parsed = warehouseReportSchema.safeParse({
    shipments: formData.get("shipments") || undefined,
    rackChanges: formData.get("rackChanges") || undefined,
    cleaning: formData.get("cleaning") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { shipments, rackChanges, cleaning, notes } = parsed.data;
  if (!shipments && !rackChanges && !cleaning && !notes) {
    return { error: "Fill in at least one section before submitting." };
  }

  await db.warehouseReport.create({
    data: { authorId: user.id, shipments, rackChanges, cleaning, notes },
  });

  await notifyManagers(user.id, {
    EN: {
      title: "Warehouse report submitted",
      body: `${user.name} just submitted a warehouse report`,
      url: "/warehouse-report",
    },
    ES: {
      title: "Reporte de almacén enviado",
      body: `${user.name} acaba de enviar un reporte de almacén`,
      url: "/warehouse-report",
    },
  }).catch(() => {});

  revalidatePath("/warehouse-report");
  revalidatePath("/");
  redirect("/warehouse-report");
}
