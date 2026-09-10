"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, getCurrentUser } from "@/lib/auth";
import { notifyUser } from "@/lib/push";

// Directives and special projects are Admin-only to write — not even
// Managers can touch them, per how this feature is meant to work: one
// person (the Admin) sets everyone's priorities.

const directiveSchema = z.object({
  userId: z.string().trim().min(1),
  text: z.string().trim().min(1, "Enter a directive").max(500),
  section: z.string().trim().max(60).optional(),
});

export type DirectiveFormState = { error?: string };

export async function addDirectiveAction(
  _prevState: DirectiveFormState,
  formData: FormData
): Promise<DirectiveFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = directiveSchema.safeParse({
    userId: formData.get("userId"),
    text: formData.get("text"),
    section: formData.get("section") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const last = await db.directive.findFirst({
    where: { userId: parsed.data.userId },
    orderBy: { sortOrder: "desc" },
  });

  const directive = await db.directive.create({
    data: {
      userId: parsed.data.userId,
      text: parsed.data.text,
      section: parsed.data.section || null,
      sortOrder: (last?.sortOrder ?? 0) + 1,
      createdById: admin.id,
    },
  });

  await notifyUser(directive.userId, admin.id, {
    EN: { title: "New priority from your Admin", body: parsed.data.text, url: "/" },
    ES: { title: "Nueva prioridad de tu Administrador", body: parsed.data.text, url: "/" },
  }).catch(() => {});

  revalidatePath("/");
  revalidatePath(`/admin/directives/${parsed.data.userId}`);
  return {};
}

export async function updateDirectiveAction(id: string, formData: FormData) {
  await requireRole(["ADMIN"]);
  const trimmed = String(formData.get("text") ?? "").trim();
  if (!trimmed) return;
  const section = String(formData.get("section") ?? "").trim();

  const directive = await db.directive.update({
    where: { id },
    data: { text: trimmed.slice(0, 500), section: section ? section.slice(0, 60) : null },
  });

  revalidatePath("/");
  revalidatePath(`/admin/directives/${directive.userId}`);
}

export async function deleteDirectiveAction(id: string) {
  await requireRole(["ADMIN"]);
  const directive = await db.directive.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath(`/admin/directives/${directive.userId}`);
}

// Reordering stays confined to the item's own section (matching same
// userId AND section, including both being null/"ungrouped" together) so
// nudging one item up/down can't accidentally jump it into another group.
export async function moveDirectiveAction(id: string, direction: "up" | "down") {
  await requireRole(["ADMIN"]);

  const current = await db.directive.findUnique({ where: { id } });
  if (!current) return;

  const neighbor = await db.directive.findFirst({
    where: {
      userId: current.userId,
      section: current.section,
      sortOrder: direction === "up" ? { lt: current.sortOrder } : { gt: current.sortOrder },
    },
    orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbor) return;

  await db.$transaction([
    db.directive.update({ where: { id: current.id }, data: { sortOrder: neighbor.sortOrder } }),
    db.directive.update({ where: { id: neighbor.id }, data: { sortOrder: current.sortOrder } }),
  ]);

  revalidatePath("/");
  revalidatePath(`/admin/directives/${current.userId}`);
}

const projectSchema = z.object({
  userId: z.string().trim().min(1),
  title: z.string().trim().min(1, "Enter a title").max(200),
  details: z.string().trim().max(4000).optional(),
  dueDate: z.string().trim().optional(),
});

export type ProjectFormState = { error?: string };

export async function addProjectAction(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const admin = await requireRole(["ADMIN"]);
  const parsed = projectSchema.safeParse({
    userId: formData.get("userId"),
    title: formData.get("title"),
    details: formData.get("details") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const project = await db.specialProject.create({
    data: {
      userId: parsed.data.userId,
      title: parsed.data.title,
      details: parsed.data.details || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      createdById: admin.id,
    },
  });

  await notifyUser(project.userId, admin.id, {
    EN: { title: "New special project assigned", body: parsed.data.title, url: "/" },
    ES: { title: "Nuevo proyecto especial asignado", body: parsed.data.title, url: "/" },
  }).catch(() => {});

  revalidatePath("/");
  revalidatePath(`/admin/directives/${parsed.data.userId}`);
  return {};
}

export async function deleteProjectAction(id: string) {
  await requireRole(["ADMIN"]);
  const project = await db.specialProject.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath(`/admin/directives/${project.userId}`);
}

// Callable by the employee it's assigned to (self-serve "done" like Tasks)
// or by the Admin who assigned it.
export async function completeProjectAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const project = await db.specialProject.findUnique({ where: { id } });
  if (!project) return;
  if (project.userId !== user.id && user.role !== "ADMIN") return;

  await db.specialProject.update({
    where: { id },
    data: { status: "DONE", completedAt: new Date() },
  });

  await notifyUser(project.createdById, user.id, {
    EN: { title: "Special project completed", body: `${user.name} marked "${project.title}" done`, url: "/" },
    ES: { title: "Proyecto especial completado", body: `${user.name} marcó "${project.title}" como hecho`, url: "/" },
  }).catch(() => {});

  revalidatePath("/");
  revalidatePath(`/admin/directives/${project.userId}`);
}

export async function reopenProjectAction(id: string) {
  await requireRole(["ADMIN"]);
  const project = await db.specialProject.update({
    where: { id },
    data: { status: "OPEN", completedAt: null },
  });

  revalidatePath("/");
  revalidatePath(`/admin/directives/${project.userId}`);
}
