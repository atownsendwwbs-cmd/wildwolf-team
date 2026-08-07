import Link from "next/link";
import AppShell from "@/components/app-shell";
import { CategoryBadge, UrgencyBadge } from "@/components/badges";
import { db } from "@/lib/db";
import { requireUser, MANAGER_ROLES } from "@/lib/auth";
import { formatDateTime, isSameDay } from "@/lib/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const canPostBrief = MANAGER_ROLES.includes(user.role);

  const [latestBrief, openAlerts, recentReports] = await Promise.all([
    db.dailyBrief.findFirst({
      orderBy: { date: "desc" },
      include: { author: { select: { name: true } } },
    }),
    db.inventoryAlert.findMany({
      where: { status: "OPEN" },
      orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: { reportedBy: { select: { name: true } } },
    }),
    db.endOfDayReport.findMany({
      orderBy: { date: "desc" },
      take: 4,
      include: { author: { select: { name: true } } },
    }),
  ]);

  const briefIsToday = latestBrief && isSameDay(latestBrief.date, new Date());
  const highUrgencyCount = openAlerts.filter((a) => a.urgency === "HIGH").length;

  return (
    <AppShell>
      <div className="space-y-8">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-white">Today&apos;s Brief</h1>
            {canPostBrief && (
              <Link href="/brief/new" className="text-sm text-orange-400 hover:text-orange-300 font-medium">
                {briefIsToday ? "Post an update" : "+ Post today's brief"}
              </Link>
            )}
          </div>
          {latestBrief ? (
            <Link
              href={`/brief/${latestBrief.id}`}
              className="block rounded-xl border border-neutral-800 bg-neutral-900 p-5 hover:border-neutral-700 transition-colors"
            >
              {!briefIsToday && (
                <p className="text-xs text-amber-400 mb-2">
                  Most recent brief — {formatDateTime(latestBrief.date)} (not posted today)
                </p>
              )}
              <h2 className="font-semibold text-white mb-1">{latestBrief.title}</h2>
              <p className="text-sm text-neutral-400 whitespace-pre-wrap line-clamp-4">
                {latestBrief.content}
              </p>
              <p className="text-xs text-neutral-500 mt-3">by {latestBrief.author.name}</p>
            </Link>
          ) : (
            <p className="text-neutral-400 text-sm">No briefs posted yet.</p>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-white">
              Open Inventory &amp; Supply Alerts
              {highUrgencyCount > 0 && (
                <span className="ml-2 text-xs font-medium text-red-400 align-middle">
                  {highUrgencyCount} high urgency
                </span>
              )}
            </h1>
            <Link href="/inventory" className="text-sm text-orange-400 hover:text-orange-300 font-medium">
              View all
            </Link>
          </div>
          {openAlerts.length === 0 ? (
            <p className="text-neutral-400 text-sm">Nothing low right now.</p>
          ) : (
            <ul className="space-y-2">
              {openAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-white truncate">{alert.itemName}</span>
                    <CategoryBadge category={alert.category} />
                  </div>
                  <UrgencyBadge urgency={alert.urgency} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-white">Recent End-of-Day Reports</h1>
            <Link href="/eod" className="text-sm text-orange-400 hover:text-orange-300 font-medium">
              View all
            </Link>
          </div>
          {recentReports.length === 0 ? (
            <p className="text-neutral-400 text-sm">No end-of-day reports yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentReports.map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/eod/${report.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2.5 hover:border-neutral-700 transition-colors"
                  >
                    <span className="text-sm text-white">{report.author.name}</span>
                    <span className="text-xs text-neutral-500">{formatDateTime(report.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Link
            href="/inventory/new"
            className="rounded-xl border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
          >
            <p className="font-semibold text-white text-sm">Report low item</p>
            <p className="text-xs text-neutral-500 mt-1">Finished goods, raw materials, supplies</p>
          </Link>
          <Link
            href="/eod/new"
            className="rounded-xl border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
          >
            <p className="font-semibold text-white text-sm">Submit end-of-day report</p>
            <p className="text-xs text-neutral-500 mt-1">Packed, sorted out, notes, hand-off</p>
          </Link>
          {canPostBrief ? (
            <Link
              href="/brief/new"
              className="rounded-xl border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
            >
              <p className="font-semibold text-white text-sm">Post daily brief</p>
              <p className="text-xs text-neutral-500 mt-1">Priorities for the team today</p>
            </Link>
          ) : (
            <Link
              href="/brief"
              className="rounded-xl border border-neutral-800 bg-neutral-900 hover:border-orange-700 hover:bg-neutral-900/80 transition-colors p-4 text-center"
            >
              <p className="font-semibold text-white text-sm">View past briefs</p>
              <p className="text-xs text-neutral-500 mt-1">Full history</p>
            </Link>
          )}
        </section>
      </div>
    </AppShell>
  );
}
