import Link from "next/link";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { parseLineItemsJson } from "@/lib/eod";

export default async function EodListPage() {
  const reports = await db.endOfDayReport.findMany({
    orderBy: { date: "desc" },
    include: { author: { select: { name: true } } },
    take: 60,
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">End of Day Reports</h1>
        <Link
          href="/eod/new"
          className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + New report
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="text-neutral-400">No end-of-day reports submitted yet.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => {
            const packed = parseLineItemsJson(report.packedItems);
            const sorted = parseLineItemsJson(report.sortedOutItems);
            return (
              <li key={report.id}>
                <Link
                  href={`/eod/${report.id}`}
                  className="block rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="font-semibold text-white">{report.author.name}</h2>
                    <span className="text-xs text-neutral-500 shrink-0">
                      {formatDateTime(report.date)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mt-1">
                    {packed.length} item{packed.length === 1 ? "" : "s"} packed
                    {sorted.length > 0 && (
                      <> · {sorted.length} sorted out</>
                    )}
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
    </AppShell>
  );
}
