"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const pinSchema = z.string().trim().regex(/^\d{4}$/, "PIN must be exactly 4 digits");

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  role: z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]),
  pin: z.union([pinSchema, z.literal("")]),
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
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const pinHash = parsed.data.pin ? await bcrypt.hash(parsed.data.pin, 10) : null;

  await db.user.create({
    data: { name: parsed.data.name, role: parsed.data.role, pinHash },
  });

  revalidatePath("/admin/users");
  revalidatePath("/login");
  return { success: `Added ${parsed.data.name}.` };
}

export async function renameUserAction(userId: string, name: string): Promise<AdminFormState> {
  await requireRole(["ADMIN"]);

  const trimmed = name.trim();
  if (!trimmed) return { error: "Name can't be empty." };
  if (trimmed.length > 100) return { error: "Name is too long." };

  await db.user.update({ where: { id: userId }, data: { name: trimmed } });

  revalidatePath("/admin/users");
  revalidatePath("/");
  return { success: "Name updated." };
}

export async function resetPinAction(userId: string, newPin: string): Promise<AdminFormState> {
  await requireRole(["ADMIN"]);

  const parsed = pinSchema.safeParse(newPin);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid PIN." };
  }

  const pinHash = await bcrypt.hash(parsed.data, 10);
  await db.user.update({ where: { id: userId }, data: { pinHash } });

  revalidatePath("/admin/users");
  revalidatePath("/login");
  return { success: "PIN updated." };
}

export async function setUserActiveAction(userId: string, active: boolean) {
  await requireRole(["ADMIN"]);
  await db.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/users");
  revalidatePath("/login");
}

export async function setUserRoleAction(userId: string, role: "ADMIN" | "MANAGER" | "EMPLOYEE") {
  await requireRole(["ADMIN"]);
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

export async function setUserDepartmentAction(userId: string, departmentId: string | null) {
  await requireRole(["ADMIN"]);
  await db.user.update({ where: { id: userId }, data: { departmentId } });
  revalidatePath("/admin/users");
  revalidatePath("/tasks");
  revalidatePath("/");
}

const departmentNameSchema = z.string().trim().min(1, "Name is required").max(60);

export async function createDepartmentAction(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole(["ADMIN"]);

  const parsed = departmentNameSchema.safeParse(formData.get("name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid name." };
  }

  const existing = await db.department.findUnique({ where: { name: parsed.data } });
  if (existing) {
    return { error: "That department already exists." };
  }

  await db.department.create({ data: { name: parsed.data } });

  revalidatePath("/admin/users");
  revalidatePath("/tasks/new");
  return { success: `Added ${parsed.data}.` };
}

export async function deleteDepartmentAction(departmentId: string) {
  await requireRole(["ADMIN"]);
  await db.department.delete({ where: { id: departmentId } });
  revalidatePath("/admin/users");
  revalidatePath("/tasks/new");
  revalidatePath("/tasks");
}
