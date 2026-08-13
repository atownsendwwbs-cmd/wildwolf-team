import { db } from "@/lib/db";
import { formatDateTime, isSameDay } from "@/lib/format";
import { isCriticalAlert } from "@/lib/inventory";
import AutoRefresh from "@/components/auto-refresh";

export const dynamic = "force-dynamic";

export default async function DisplayPage() {
  const [latestBrief, announcements, openAlerts] = await Promise.all([
    db.dailyBrief.findFirst({
      orderBy: { date: "desc" },
      include: { author: { select: { name: true } } },
    }),
    db.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { author: { select: { name: true } } },
    }),
    db.inventoryAlert.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: { reportedBy: { select: { name: true } } },
    }),
  ]);

  const briefIsToday = latestBrief && isSameDay(latestBrief.date, new Date());
  const criticalAlerts = openAlerts.filter(isCriticalAlert);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-10">
      <AutoRefresh seconds={30} />
      <div className="h-1.5 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600 -mt-10 -mx-10 mb-8" />

      <header className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          🐺 Wild <span className="text-orange-400">Wolf</span> Warehouse
        </h1>
        <p className="text-xl text-neutral-400">
          {new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date())}
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <section className="col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold uppercase tracking-wide text-orange-400 mb-3">
              Announcements
            </h2>
            {announcements.length === 0 ? (
              <p className="text-2xl text-neutral-500">Nothing posted yet today.</p>
            ) : (
              <ul className="space-y-4">
                {announcements.map((a) => (
                  <li key={a.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                    <p className="text-2xl leading-snug">{a.message}</p>
                    <p className="text-base text-neutral-500 mt-2">
                      {a.author.name} · {formatDateTime(a.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {latestBrief && (
            <div>
              <h2 className="text-lg font-semibold uppercase tracking-wide text-orange-400 mb-3">
                {briefIsToday ? "Today's Brief" : "Most Recent Brief"}
              </h2>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-2xl font-bold mb-2">{latestBrief.titleEn}</p>
                <p className="text-xl text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {latestBrief.introEn}
                </p>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold uppercase tracking-wide text-red-400 mb-3">
            Critical Inventory
          </h2>
          {criticalAlerts.length === 0 ? (
            <p className="text-xl text-neutral-500">Nothing critical. 🎉</p>
          ) : (
            <ul className="space-y-3">
              {criticalAlerts.map((alert) => (
                <li key={alert.id} className="rounded-xl border border-red-900 bg-red-950/30 p-4">
                  <p className="text-xl font-semibold">{alert.itemName}</p>
                  {alert.category === "RAW_MATERIAL" && alert.quantity && (
                    <p className="text-base text-red-300 mt-1">Left: {alert.quantity}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
