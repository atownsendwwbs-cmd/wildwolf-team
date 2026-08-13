import Link from "next/link";
import AppShell from "@/components/app-shell";
import BilingualBrief from "@/components/bilingual-brief";
import { CategoryBadge, UrgencyBadge, StockLevelBadge, RawMaterialStatusBadge } from "@/components/badges";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { formatDateTime, isSameDay } from "@/lib/format";
import { isCriticalAlert } from "@/lib/inventory";
import { completeTaskAction } from "@/lib/actions/tasks";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const canPostBrief = !!user && MANAGER_ROLES.includes(user.role);

  const [latestBrief, openAlerts, recentReports, myTasks] = await Promise.all([
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
          where: { status: "OPEN", OR: [{ assignedToId: user.id }, { assignedToId: null }] },
          orderBy: { createdAt: "desc" },
          take: 5,
          include: { assignedTo: { select: { name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const briefIsToday = latestBrief && isSameDay(latestBrief.date, new Date());
  const criticalCount = openAlerts.filter(isCriticalAlert).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Daily Brief — the focal point of the dashboard */}
        {latestBrief ? (
          <section className="relative overflow-hidden rounded-lg border border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-900/60">
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
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-800">
                <p className="text-xs text-neutral-500">by {latestBrief.author.name}</p>
                <div className="flex items-center gap-4">
                  <Link href="/brief" className="text-sm text-neutral-400 hover:text-white font-medium">
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
          <section className="rounded-lg border border-dashed border-neutral-700 bg-neutral-900/40 p-8 text-center">
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

        {/* My Tasks */}
        {user && myTasks.length > 0 && (
          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">My Tasks</h2>
              <Link href="/tasks" className="text-xs text-orange-400 hover:text-orange-300 font-medium shrink-0">
                View all
              </Link>
            </div>
            <ul className="space-y-2">
              {myTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2"
                >
                  <div className="min-w-0">
                    <span className="text-sm text-white">{task.title}</span>
                    {!task.assignedTo && (
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
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Secondary info: alerts + EOD reports side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
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
                      <span className="text-sm text-white truncate">{alert.itemName}</span>
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
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">
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
                      <span className="text-sm text-white">{report.author.name}</span>
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
            <p className="font-semibold text-white text-sm">Report low item</p>
            <p className="text-xs text-neutral-500 mt-1">Finished goods, raw materials, supplies</p>
          </Link>
          <Link
            href="/eod/new"
            className="rounded-lg border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
          >
            <p className="font-semibold text-white text-sm">Submit end-of-day report</p>
            <p className="text-xs text-neutral-500 mt-1">Packed, sorted out, notes, hand-off</p>
          </Link>
          {canPostBrief && (
            <Link
              href="/tasks/new"
              className="rounded-lg border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
            >
              <p className="font-semibold text-white text-sm">Assign a task</p>
              <p className="text-xs text-neutral-500 mt-1">Send it to someone&apos;s phone</p>
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
