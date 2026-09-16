"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { notifyManagers } from "@/lib/push";

const timeOffSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(200),
  date: z.string().trim().min(1, "Select a date"),
  timeNote: z.string().trim().min(1, "Enter a time").max(200),
  returnDate: z.string().trim().optional(),
  reason: z.string().trim().min(1, "Enter a reason").max(300),
  notes: z.string().trim().max(3000).optional(),
});

export type TimeOffFormState = { error?: string; success?: boolean };

// Deliberately does NOT require sign-in -- anyone reporting they're sick,
// running late, leaving early, or can't make it in should be able to
// submit this without needing an account or a PIN.
export async function createTimeOffRequestAction(
  _prevState: TimeOffFormState,
  formData: FormData
): Promise<TimeOffFormState> {
  const user = await getCurrentUser();

  const parsed = timeOffSchema.safeParse({
    name: formData.get("name"),
    date: formData.get("date"),
    timeNote: formData.get("timeNote"),
    returnDate: formData.get("returnDate") || undefined,
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.timeOffRequest.create({
    data: {
      name: parsed.data.name,
      submittedById: user?.id,
      date: new Date(`${parsed.data.date}T12:00:00`),
      timeNote: parsed.data.timeNote,
      returnDate: parsed.data.returnDate ? new Date(`${parsed.data.returnDate}T12:00:00`) : null,
      reason: parsed.data.reason,
      notes: parsed.data.notes,
    },
  });

  await notifyManagers(user?.id ?? "", {
    EN: {
      title: "Time off / absence reported",
      body: `${parsed.data.name} — ${parsed.data.reason}`,
      url: "/time-off",
    },
    ES: {
      title: "Ausencia reportada",
      body: `${parsed.data.name} — ${parsed.data.reason}`,
      url: "/time-off",
    },
  }).catch(() => {});

  revalidatePath("/time-off");
  return { success: true };
}
