import Link from "next/link";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";

export default async function TimeOffListPage() {
  await requireRole(MANAGER_ROLES);

  const requests = await db.timeOffRequest.findMany({
    orderBy: { date: "desc" },
    take: 100,
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-bold text-black">Time Off / Absences</h1>
        <Link
          href="/time-off/new"
          className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + New report
        </Link>
      </div>
      <p className="text-sm text-neutral-500 mb-6">Only Admins and Managers can see this.</p>

      {requests.length === 0 ? (
        <p className="text-neutral-400">Nothing reported yet.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-semibold text-black">{r.name}</h2>
                <span className="text-xs text-neutral-500 shrink-0">
                  {formatDate(r.date)}
                  {r.returnDate ? ` – ${formatDate(r.returnDate)}` : ""}
                </span>
              </div>
              <p className="text-sm text-neutral-300 mt-1">
                {r.reason} — {r.timeNote}
              </p>
              {r.returnDate && (
                <p className="text-xs text-amber-500 mt-1">Back {formatDate(r.returnDate)}</p>
              )}
              {r.notes && <p className="text-sm text-neutral-500 mt-1 whitespace-pre-wrap">{r.notes}</p>}
              <p className="text-xs text-neutral-600 mt-2">Reported {formatDateTime(r.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
