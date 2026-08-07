import { notFound } from "next/navigation";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { parseLineItemsJson, type LineItem } from "@/lib/eod";

function LineItemTable({ title, items, emptyLabel }: { title: string; items: LineItem[]; emptyLabel: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-300 mb-2">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">{emptyLabel}</p>
      ) : (
        <div className="rounded-lg border border-neutral-800 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className={i > 0 ? "border-t border-neutral-800" : ""}>
                  <td className="px-3 py-2 text-neutral-200 font-medium">{item.label}</td>
                  <td className="px-3 py-2 text-neutral-400 w-24">{item.quantity}</td>
                  <td className="px-3 py-2 text-neutral-500">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default async function EodDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const report = await db.endOfDayReport.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });

  if (!report) notFound();

  const packed = parseLineItemsJson(report.packedItems);
  const sorted = parseLineItemsJson(report.sortedOutItems);

  return (
    <AppShell>
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">{report.author.name}&apos;s end-of-day report</h1>
          <p className="text-sm text-neutral-500 mt-1">{formatDateTime(report.date)}</p>
        </div>

        <LineItemTable title="Packed today" items={packed} emptyLabel="Nothing logged." />
        <LineItemTable
          title="Sorted out / rejected"
          items={sorted}
          emptyLabel="Nothing sorted out."
        />

        {report.leftOff && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 mb-2">Where they left off</h3>
            <p className="text-neutral-200 whitespace-pre-wrap">{report.leftOff}</p>
          </div>
        )}

        {report.notes && (
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 mb-2">Notes</h3>
            <p className="text-neutral-200 whitespace-pre-wrap">{report.notes}</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
