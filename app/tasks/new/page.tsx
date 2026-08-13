import AppShell from "@/components/app-shell";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import TaskForm from "./task-form";

export default async function NewTaskPage() {
  await requireRole(MANAGER_ROLES);

  const [people, departments] = await Promise.all([
    db.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    db.department.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">Assign a task</h1>
      <TaskForm people={people} departments={departments} />
    </AppShell>
  );
}
