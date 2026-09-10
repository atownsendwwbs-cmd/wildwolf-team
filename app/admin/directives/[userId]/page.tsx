import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  updateDirectiveAction,
  deleteDirectiveAction,
  moveDirectiveAction,
  deleteProjectAction,
  completeProjectAction,
  reopenProjectAction,
} from "@/lib/actions/directives";
import DirectiveAddForm from "./directive-add-form";
import ProjectAddForm from "./project-add-form";

export default async function AdminDirectivesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireRole(["ADMIN"]);
  const { userId } = await params;

  const [person, directives, projects] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.directive.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
    db.specialProject.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!person) notFound();

  const openProjects = projects.filter((p) => p.status === "OPEN");
  const doneProjects = projects.filter((p) => p.status === "DONE");

  return (
    <AppShell>
      <div className="mb-6">
        <Link href="/admin/users" className="text-sm text-neutral-400 hover:text-black">
          ← Team
        </Link>
        <h1 className="text-xl font-bold text-black mt-2">Directives &amp; Projects — {person.name}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Only {person.name} and Admins can see this. Directives stay current until you change or remove
          them — no need to re-enter anything daily.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-3">Daily Directives</h2>
        {directives.length > 0 && (
          <ul className="space-y-2 mb-4">
            {directives.map((d, i) => (
              <li
                key={d.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2"
              >
                <span className="text-orange-400 font-bold text-sm shrink-0 w-5">{i + 1}.</span>
                <form action={updateDirectiveAction.bind(null, d.id)} className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    name="text"
                    defaultValue={d.text}
                    maxLength={500}
                    className="flex-1 rounded-md bg-neutral-950 border border-neutral-700 text-black px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="shrink-0 text-xs px-2.5 py-1.5 rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
                  >
                    Save
                  </button>
                </form>
                <div className="flex items-center gap-1 shrink-0">
                  <form action={moveDirectiveAction.bind(null, d.id, "up")}>
                    <button
                      type="submit"
                      disabled={i === 0}
                      className="text-neutral-400 hover:text-black disabled:opacity-30 disabled:hover:text-neutral-400 px-1.5 py-1"
                      title="Move up"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveDirectiveAction.bind(null, d.id, "down")}>
                    <button
                      type="submit"
                      disabled={i === directives.length - 1}
                      className="text-neutral-400 hover:text-black disabled:opacity-30 disabled:hover:text-neutral-400 px-1.5 py-1"
                      title="Move down"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deleteDirectiveAction.bind(null, d.id)}>
                    <button
                      type="submit"
                      className="text-xs px-2 py-1.5 rounded-md border border-red-900 text-red-400 hover:bg-red-950/40 transition-colors"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        <DirectiveAddForm userId={userId} />
      </section>

      <section>
        <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-3">Special Projects</h2>

        {openProjects.length > 0 && (
          <ul className="space-y-2 mb-4">
            {openProjects.map((p) => (
              <li key={p.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black">{p.title}</p>
                    {p.details && <p className="text-xs text-neutral-400 mt-1 whitespace-pre-wrap">{p.details}</p>}
                    {p.dueDate && <p className="text-xs text-neutral-500 mt-1">Due {formatDate(p.dueDate)}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={completeProjectAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="text-xs px-2.5 py-1 rounded-md border border-green-800 text-green-400 hover:bg-green-950/40 transition-colors whitespace-nowrap"
                      >
                        Mark done
                      </button>
                    </form>
                    <form action={deleteProjectAction.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="text-xs px-2 py-1 rounded-md border border-red-900 text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ProjectAddForm userId={userId} />

        {doneProjects.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Completed</h3>
            <ul className="space-y-1.5">
              {doneProjects.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                >
                  <span className="text-sm text-neutral-400 line-through">{p.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={reopenProjectAction.bind(null, p.id)}>
                      <button type="submit" className="text-xs text-neutral-400 hover:text-black">
                        Reopen
                      </button>
                    </form>
                    <form action={deleteProjectAction.bind(null, p.id)}>
                      <button type="submit" className="text-xs text-red-400 hover:text-red-300">
                        ✕
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </AppShell>
  );
}
