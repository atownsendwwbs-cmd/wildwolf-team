import { notFound } from "next/navigation";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

function Section({ title, body }: { title: string; body: string | null }) {
  if (!body) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-300 mb-2">{title}</h3>
      <p className="text-black whitespace-pre-wrap">{body}</p>
    </div>
  );
}

export default async function WarehouseReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const report = await db.warehouseReport.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });

  if (!report) notFound();

  const hasAnyContent = report.shipments || report.rackChanges || report.cleaning || report.notes;

  return (
    <AppShell>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-black">{report.author.name}&apos;s warehouse report</h1>
          <p className="text-sm text-neutral-500 mt-1">{formatDateTime(report.date)}</p>
        </div>

        {!hasAnyContent && <p className="text-sm text-neutral-500">Nothing logged.</p>}
        <Section title="Shipments received / going out" body={report.shipments} />
        <Section title="Rack / product location changes" body={report.rackChanges} />
        <Section title="Cleaning" body={report.cleaning} />
        <Section title="General" body={report.notes} />
      </div>
    </AppShell>
  );
}
