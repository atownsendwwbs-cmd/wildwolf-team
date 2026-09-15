import Link from "next/link";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function WarehouseReportListPage() {
  const reports = await db.warehouseReport.findMany({
    orderBy: { date: "desc" },
    include: { author: { select: { name: true } } },
    take: 60,
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-black">Warehouse Reports</h1>
        <Link
          href="/warehouse-report/new"
          className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + New report
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="text-neutral-400">No warehouse reports submitted yet.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/warehouse-report/${report.id}`}
                className="block rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="font-semibold text-black">{report.author.name}</h2>
                  <span className="text-xs text-neutral-500 shrink-0">{formatDateTime(report.date)}</span>
                </div>
                {report.shipments && (
                  <p className="text-sm text-neutral-400 mt-1 line-clamp-1">Shipments: {report.shipments}</p>
                )}
                {!report.shipments && report.notes && (
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{report.notes}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
