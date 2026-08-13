import Link from "next/link";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { completeTaskAction, reopenTaskAction } from "@/lib/actions/tasks";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  const canManage = !!user && MANAGER_ROLES.includes(user.role);
  const { status } = await searchParams;
  const filter = status === "done" ? "DONE" : "OPEN";

  const tasks = await db.task.findMany({
    where: { status: filter },
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: { select: { id: true, name: true } },
      assignedBy: { select: { name: true } },
    },
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Tasks</h1>
        {canManage && (
          <Link
            href="/tasks/new"
            className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + New task
          </Link>
        )}
      </div>

      <div className="flex gap-2 mb-5">
        <Link
          href="/tasks?status=open"
          className={`text-sm px-3 py-1.5 rounded-md border ${
            filter === "OPEN"
              ? "bg-neutral-800 border-neutral-600 text-white"
              : "border-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          Open
        </Link>
        <Link
          href="/tasks?status=done"
          className={`text-sm px-3 py-1.5 rounded-md border ${
            filter === "DONE"
              ? "bg-neutral-800 border-neutral-600 text-white"
              : "border-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          Done
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-neutral-400">
          {filter === "OPEN" ? "No open tasks. 🎉" : "Nothing marked done yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => {
            const canComplete =
              !!user && (task.assignedToId === user.id || task.assignedToId === null || canManage);
            return (
              <li
                key={task.id}
                className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h2 className="font-semibold text-white">{task.title}</h2>
                      <span className="inline-flex items-center rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-0.5 text-xs text-neutral-300">
                        {task.assignedTo ? task.assignedTo.name : "Everyone"}
                      </span>
                    </div>
                    {task.details && (
                      <p className="text-sm text-neutral-400 whitespace-pre-wrap">{task.details}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-2">
                      Assigned by {task.assignedBy.name} · {formatDateTime(task.createdAt)}
                      {task.status === "DONE" && task.completedAt && (
                        <> · Completed {formatDateTime(task.completedAt)}</>
                      )}
                    </p>
                  </div>
                  {task.status === "OPEN" && canComplete && (
                    <form action={completeTaskAction.bind(null, task.id)}>
                      <button
                        type="submit"
                        className="text-sm px-3 py-1.5 rounded-md border border-green-800 text-green-400 hover:bg-green-950/40 shrink-0 transition-colors"
                      >
                        Mark done
                      </button>
                    </form>
                  )}
                  {task.status === "DONE" && canManage && (
                    <form action={reopenTaskAction.bind(null, task.id)}>
                      <button
                        type="submit"
                        className="text-sm px-3 py-1.5 rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 shrink-0 transition-colors"
                      >
                        Reopen
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
