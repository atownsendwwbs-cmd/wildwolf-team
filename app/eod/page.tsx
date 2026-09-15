import Link from "next/link";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { parseLineItemsJson } from "@/lib/eod";

export default async function EodListPage() {
  const [productionReports, warehouseReports] = await Promise.all([
    db.endOfDayReport.findMany({
      orderBy: { date: "desc" },
      include: { author: { select: { name: true } } },
      take: 60,
    }),
    db.warehouseReport.findMany({
      orderBy: { date: "desc" },
      include: { author: { select: { name: true } } },
      take: 60,
    }),
  ]);

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">End of Day Reports</h1>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Production Report</h2>
          <Link
            href="/eod/new"
            className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + New report
          </Link>
        </div>

        {productionReports.length === 0 ? (
          <p className="text-neutral-400">No production reports submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {productionReports.map((report) => {
              const packed = parseLineItemsJson(report.packedItems);
              const sorted = parseLineItemsJson(report.sortedOutItems);
              return (
                <li key={report.id}>
                  <Link
                    href={`/eod/${report.id}`}
                    className="block rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-semibold text-black">{report.author.name}</h3>
                      <span className="text-xs text-neutral-500 shrink-0">
                        {formatDateTime(report.date)}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">
                      {packed.length} item{packed.length === 1 ? "" : "s"} packed
                      {sorted.length > 0 && <> · {sorted.length} sorted out</>}
                    </p>
                    {report.leftOff && (
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
                        Left off: {report.leftOff}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Warehouse Report</h2>
          <Link
            href="/warehouse-report/new"
            className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + New report
          </Link>
        </div>

        {warehouseReports.length === 0 ? (
          <p className="text-neutral-400">No warehouse reports submitted yet.</p>
        ) : (
          <ul className="space-y-3">
            {warehouseReports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/warehouse-report/${report.id}`}
                  className="block rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-semibold text-black">{report.author.name}</h3>
                    <span className="text-xs text-neutral-500 shrink-0">
                      {formatDateTime(report.date)}
                    </span>
                  </div>
                  {report.shipments && (
                    <p className="text-sm text-neutral-400 mt-1 line-clamp-1">
                      Shipments: {report.shipments}
                    </p>
                  )}
                  {!report.shipments && report.notes && (
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{report.notes}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
