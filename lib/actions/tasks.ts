"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser, requireRole, MANAGER_ROLES } from "@/lib/auth";
import { sendPushToUsers } from "@/lib/push";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  details: z.string().trim().max(2000).optional(),
  assignedToId: z.string().trim().optional(),
});

export type TaskFormState = { error?: string };

export async function createTaskAction(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const user = await requireRole(MANAGER_ROLES);

  const parsed = taskSchema.safeParse({
    title: formData.get("title"),
    details: formData.get("details") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { title, details, assignedToId } = parsed.data;

  let assignee = null;
  if (assignedToId) {
    assignee = await db.user.findUnique({ where: { id: assignedToId } });
    if (!assignee || !assignee.active) {
      return { error: "Selected person not found." };
    }
  }

  await db.task.create({
    data: {
      title,
      details,
      assignedToId: assignee?.id,
      assignedById: user.id,
    },
  });

  sendPushToUsers(assignee ? [assignee.id] : "all", {
    title: assignee ? "New task for you" : "New task for everyone",
    body: title,
    url: "/tasks",
  }).catch(() => {});

  revalidatePath("/tasks");
  revalidatePath("/");
  redirect("/tasks");
}

export async function completeTaskAction(taskId: string) {
  const user = await requireUser();

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  const canComplete =
    task.assignedToId === user.id || task.assignedToId === null || MANAGER_ROLES.includes(user.role);
  if (!canComplete) return;

  await db.task.update({
    where: { id: taskId },
    data: { status: "DONE", completedAt: new Date() },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function reopenTaskAction(taskId: string) {
  await requireRole(MANAGER_ROLES);

  await db.task.update({
    where: { id: taskId },
    data: { status: "OPEN", completedAt: null },
  });

  revalidatePath("/tasks");
  revalidatePath("/");
}
