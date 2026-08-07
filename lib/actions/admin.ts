"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
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
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  await db.user.create({
    data: { name: parsed.data.name, role: parsed.data.role },
  });

  revalidatePath("/admin/users");
  return { success: `Added ${parsed.data.name}.` };
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
