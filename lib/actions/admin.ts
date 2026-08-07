"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  pin: z.string().trim().min(4, "PIN must be at least 4 digits").max(8, "PIN must be at most 8 digits"),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
});

export type AdminFormState = { error?: string; success?: string };

export async function createUserAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole(["ADMIN"]);

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    pin: formData.get("pin"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const pinHash = await bcrypt.hash(parsed.data.pin, 10);
  await db.user.create({
    data: { name: parsed.data.name, pinHash, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  return { success: `Added ${parsed.data.name}.` };
}

export async function resetPinAction(userId: string, newPin: string): Promise<AdminFormState> {
  await requireRole(["ADMIN"]);

  const pin = newPin.trim();
  if (pin.length < 4 || pin.length > 8) {
    return { error: "PIN must be 4-8 digits." };
  }

  const pinHash = await bcrypt.hash(pin, 10);
  await db.user.update({ where: { id: userId }, data: { pinHash } });

  revalidatePath("/admin/users");
  return { success: "PIN updated." };
}

export async function setUserActiveAction(userId: string, active: boolean) {
  await requireRole(["ADMIN"]);
  await db.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
}

export async function setUserRoleAction(userId: string, role: "ADMIN" | "MANAGER" | "EMPLOYEE") {
  await requireRole(["ADMIN"]);
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}
