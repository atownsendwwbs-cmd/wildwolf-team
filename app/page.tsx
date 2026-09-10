import Link from "next/link";
import AppShell from "@/components/app-shell";
import BilingualBrief from "@/components/bilingual-brief";
import AnnouncementItem from "@/components/announcement-item";
import ReactionBar from "@/components/reaction-bar";
import { CategoryBadge, UrgencyBadge, StockLevelBadge, RawMaterialStatusBadge } from "@/components/badges";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { getReactionSummaries } from "@/lib/reactions";
import { formatDate, formatDateTime, isSameDay } from "@/lib/format";
import { isCriticalAlert } from "@/lib/inventory";
import { completeTaskAction } from "@/lib/actions/tasks";
import { completeProjectAction } from "@/lib/actions/directives";
import { groupDirectives } from "@/lib/directives";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const canPostBrief = !!user && MANAGER_ROLES.includes(user.role);

  const [latestBrief, openAlerts, recentReports, myTasks, recentAnnouncements, myDirectives, myProjects] =
    await Promise.all([
      db.dailyBrief.findFirst({
        orderBy: { date: "desc" },
        include: { author: { select: { name: true } } },
      }),
      db.inventoryAlert.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { reportedBy: { select: { name: true } } },
      }),
      db.endOfDayReport.findMany({
        orderBy: { date: "desc" },
        take: 4,
        include: { author: { select: { name: true } } },
      }),
      user
        ? db.task.findMany({
            where: {
              status: "OPEN",
              OR: [
                { assignedToId: user.id },
                { assignedToId: null, departmentId: null },
                ...(user.departmentId ? [{ departmentId: user.departmentId }] : []),
              ],
            },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { assignedTo: { select: { name: true } }, department: { select: { name: true } } },
          })
        : Promise.resolve([]),
      db.announcement.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { author: { select: { name: true } } },
      }),
      // Directives/projects are private -- only ever fetched for the
      // signed-in user's own id, never for anyone else.
      user
        ? db.directive.findMany({ where: { userId: user.id }, orderBy: { sortOrder: "asc" } })
        : Promise.resolve([]),
      user
        ? db.specialProject.findMany({ where: { userId: user.id, status: "OPEN" }, orderBy: { createdAt: "asc" } })
        : Promise.resolve([]),
    ]);

  const [briefReactions, taskReactions, announcementReactions] = await Promise.all([
    getReactionSummaries("BRIEF", latestBrief ? [latestBrief.id] : [], user?.id ?? null),
    getReactionSummaries(
      "TASK",
      myTasks.map((t) => t.id),
      user?.id ?? null
    ),
    getReactionSummaries(
      "ANNOUNCEMENT",
      recentAnnouncements.map((a) => a.id),
      user?.id ?? null
    ),
  ]);

  const briefIsToday = latestBrief && isSameDay(latestBrief.date, new Date());
  const criticalCount = openAlerts.filter(isCriticalAlert).length;
  const myDirectiveGroups = groupDirectives(myDirectives);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* My Priorities — private to the signed-in user, front and center */}
        {user && (myDirectives.length > 0 || myProjects.length > 0) && (
          <section className="rounded-lg border border-orange-800/60 bg-gradient-to-br from-neutral-900 to-neutral-900/60 p-4 sm:p-5">
            <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-3">
              Your Priorities Today
            </h2>
            {myDirectiveGroups.map((group) => (
              <div key={group.section ?? "__none"} className="mb-4">
                {group.section && (
                  <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-1.5">
                    {group.section}
                  </h3>
                )}
                <ul className="space-y-2">
                  {group.items.map((d, i) => (
                    <li
                      key={d.id}
                      className="flex items-start gap-2.5 rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                    >
                      <span className="text-orange-400 font-bold text-sm shrink-0">{i + 1}.</span>
                      <span className="text-sm text-black">{d.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {myProjects.length > 0 && (
              <div className="space-y-2">
                {myProjects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-black">{p.title}</p>
                        {p.details && <p className="text-xs text-neutral-400 mt-0.5">{p.details}</p>}
                        {p.dueDate && (
                          <p className="text-xs text-neutral-500 mt-1">Due {formatDate(p.dueDate)}</p>
                        )}
                      </div>
                      <form action={completeProjectAction.bind(null, p.id)} className="shrink-0">
                        <button
                          type="submit"
                          className="text-xs px-2.5 py-1 rounded-md border border-green-800 text-green-400 hover:bg-green-950/40 transition-colors whitespace-nowrap"
                        >
                          Mark done
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Brief — the focal point of the dashboard */}
          <div className="lg:col-span-2">
            {latestBrief ? (
              <section className="relative overflow-hidden rounded-lg border border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-900/60 h-full">
                <div className="absolute inset-y-0 left-0 w-1 bg-orange-500" />
                <div className="p-6 sm:p-8">
                  {!briefIsToday && (
                    <p className="text-xs text-amber-400 mb-3 font-medium">
                      Most recent brief — {formatDateTime(latestBrief.date)} (nothing posted today yet)
                    </p>
                  )}
                  <BilingualBrief
                    titleEn={latestBrief.titleEn}
                    titleEs={latestBrief.titleEs}
                    introEn={latestBrief.introEn}
                    introEs={latestBrief.introEs}
                    productionEn={latestBrief.productionEn}
                    productionEs={latestBrief.productionEs}
                    packingEn={latestBrief.packingEn}
                    packingEs={latestBrief.packingEs}
                    specialEn={latestBrief.specialEn}
                    specialEs={latestBrief.specialEs}
                    sourceLang={latestBrief.sourceLang}
                    translated={latestBrief.translated}
                    defaultLang={user?.preferredLang}
                    size="hero"
                  />
                  <ReactionBar
                    messageType="BRIEF"
                    messageId={latestBrief.id}
                    reactions={briefReactions[latestBrief.id] ?? []}
                    canReact={!!user}
                  />
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-800">
                    <p className="text-xs text-neutral-500">
                      by {latestBrief.author.name}
                      {latestBrief.editedAt && <> · edited</>}
                    </p>
                    <div className="flex items-center gap-4">
                      <Link href="/brief" className="text-sm text-neutral-400 hover:text-black font-medium">
                        Past briefs
                      </Link>
                      {canPostBrief && (
                        <Link
                          href="/brief/new"
                          className="text-sm text-orange-400 hover:text-orange-300 font-semibold"
                        >
                          {briefIsToday ? "Post an update →" : "+ Post today's brief"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900/40 p-8 text-center h-full">
                <span className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Daily Brief
                </span>
                <p className="text-neutral-300 mt-2">No brief posted yet.</p>
                {canPostBrief && (
                  <Link
                    href="/brief/new"
                    className="inline-block mt-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                  >
                    Post today&apos;s brief
                  </Link>
                )}
              </section>
            )}
          </div>

          {/* Announcements */}
          <div className="lg:col-span-1">
            <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 h-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-black uppercase tracking-wide">Announcements</h2>
                <Link href="/announcements" className="text-xs text-orange-400 hover:text-orange-300 font-medium shrink-0">
                  View all
                </Link>
              </div>
              {recentAnnouncements.length === 0 ? (
                <p className="text-neutral-500 text-sm">Nothing posted yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentAnnouncements.map((a) => (
                    <li key={a.id} className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2.5">
                      <AnnouncementItem
                        id={a.id}
                        messageEn={a.messageEn}
                        messageEs={a.messageEs}
                        sourceLang={a.sourceLang}
                        translated={a.translated}
                        editedAt={a.editedAt}
                        authorName={a.author.name}
                        createdAtLabel={formatDateTime(a.createdAt)}
                        defaultLang={user?.preferredLang}
                        canEdit={!!user && (user.id === a.authorId || MANAGER_ROLES.includes(user.role))}
                        canReact={!!user}
                        reactions={announcementReactions[a.id] ?? []}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>

        {/* My Tasks */}
        {user && myTasks.length > 0 && (
          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-black uppercase tracking-wide">My Tasks</h2>
              <Link href="/tasks" className="text-xs text-orange-400 hover:text-orange-300 font-medium shrink-0">
                View all
              </Link>
            </div>
            <ul className="space-y-2">
              {myTasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-sm text-black">{task.title}</span>
                      {!task.assignedTo && task.department && (
                        <span className="ml-2 text-xs text-neutral-500">({task.department.name})</span>
                      )}
                      {!task.assignedTo && !task.department && (
                        <span className="ml-2 text-xs text-neutral-500">(everyone)</span>
                      )}
                    </div>
                    <form action={completeTaskAction.bind(null, task.id)} className="shrink-0">
                      <button
                        type="submit"
                        className="text-xs px-2.5 py-1 rounded-md border border-green-800 text-green-400 hover:bg-green-950/40 transition-colors"
                      >
                        Mark done
                      </button>
                    </form>
                  </div>
                  <ReactionBar
                    messageType="TASK"
                    messageId={task.id}
                    reactions={taskReactions[task.id] ?? []}
                    canReact={!!user}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Secondary info: alerts + EOD reports side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-black uppercase tracking-wide">
                Inventory &amp; Supply Alerts
                {criticalCount > 0 && (
                  <span className="ml-2 text-xs font-semibold text-red-400 normal-case tracking-normal">
                    {criticalCount} critical
                  </span>
                )}
              </h2>
              <Link href="/inventory" className="text-xs text-orange-400 hover:text-orange-300 font-medium shrink-0">
                View all
              </Link>
            </div>
            {openAlerts.length === 0 ? (
              <p className="text-neutral-500 text-sm">Nothing low right now.</p>
            ) : (
              <ul className="space-y-2">
                {openAlerts.map((alert) => (
                  <li
                    key={alert.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-black truncate">{alert.itemName}</span>
                      <CategoryBadge category={alert.category} />
                    </div>
                    {alert.category === "FINISHED_GOOD" && alert.stockLevel && (
                      <StockLevelBadge stockLevel={alert.stockLevel} />
                    )}
                    {alert.category === "RAW_MATERIAL" && alert.rawMaterialStatus && (
                      <RawMaterialStatusBadge status={alert.rawMaterialStatus} />
                    )}
                    {alert.category === "SUPPLY" && alert.urgency && (
                      <UrgencyBadge urgency={alert.urgency} />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-black uppercase tracking-wide">
                Recent End-of-Day Reports
              </h2>
              <Link href="/eod" className="text-xs text-orange-400 hover:text-orange-300 font-medium shrink-0">
                View all
              </Link>
            </div>
            {recentReports.length === 0 ? (
              <p className="text-neutral-500 text-sm">No end-of-day reports yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentReports.map((report) => (
                  <li key={report.id}>
                    <Link
                      href={`/eod/${report.id}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 hover:border-neutral-600 transition-colors"
                    >
                      <span className="text-sm text-black">{report.author.name}</span>
                      <span className="text-xs text-neutral-500">{formatDateTime(report.date)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/inventory/new"
            className="rounded-lg border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
          >
            <p className="font-semibold text-black text-sm">Report low item</p>
            <p className="text-xs text-neutral-500 mt-1">Finished goods, raw materials, supplies</p>
          </Link>
          <Link
            href="/eod/new"
            className="rounded-lg border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
          >
            <p className="font-semibold text-black text-sm">Submit end-of-day report</p>
            <p className="text-xs text-neutral-500 mt-1">Packed, sorted out, notes, hand-off</p>
          </Link>
          {canPostBrief && (
            <Link
              href="/tasks/new"
              className="rounded-lg border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
            >
              <p className="font-semibold text-black text-sm">Assign a task</p>
              <p className="text-xs text-neutral-500 mt-1">Send it to someone&apos;s phone</p>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
