import Link from "next/link";
import AppShell from "@/components/app-shell";
import { CategoryBadge, UrgencyBadge } from "@/components/badges";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { resolveAlertAction, reopenAlertAction } from "@/lib/actions/inventory";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  const canResolve = !!user && MANAGER_ROLES.includes(user.role);
  const { status } = await searchParams;
  const filter = status === "resolved" ? "RESOLVED" : "OPEN";

  const alerts = await db.inventoryAlert.findMany({
    where: { status: filter },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    include: {
      reportedBy: { select: { name: true } },
      resolvedBy: { select: { name: true } },
    },
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-white">Low Inventory &amp; Supply Alerts</h1>
        <Link
          href="/inventory/new"
          className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          + Report low item
        </Link>
      </div>

      <div className="flex gap-2 mb-5">
        <Link
          href="/inventory?status=open"
          className={`text-sm px-3 py-1.5 rounded-md border ${
            filter === "OPEN"
              ? "bg-neutral-800 border-neutral-600 text-white"
              : "border-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          Open
        </Link>
        <Link
          href="/inventory?status=resolved"
          className={`text-sm px-3 py-1.5 rounded-md border ${
            filter === "RESOLVED"
              ? "bg-neutral-800 border-neutral-600 text-white"
              : "border-neutral-800 text-neutral-400 hover:text-white"
          }`}
        >
          Resolved
        </Link>
      </div>

      {alerts.length === 0 ? (
        <p className="text-neutral-400">
          {filter === "OPEN" ? "Nothing low right now. 🎉" : "No resolved alerts yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <h2 className="font-semibold text-white">{alert.itemName}</h2>
                    <CategoryBadge category={alert.category} />
                    <UrgencyBadge urgency={alert.urgency} />
                  </div>
                  {alert.notes && (
                    <p className="text-sm text-neutral-400 whitespace-pre-wrap">{alert.notes}</p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2">
                    Reported by {alert.reportedBy.name} · {formatDateTime(alert.createdAt)}
                    {alert.status === "RESOLVED" && alert.resolvedBy && (
                      <>
                        {" "}
                        · Resolved by {alert.resolvedBy.name}
                        {alert.resolvedAt ? ` · ${formatDateTime(alert.resolvedAt)}` : ""}
                      </>
                    )}
                  </p>
                </div>
                {canResolve && (
                  <form
                    action={
                      alert.status === "OPEN"
                        ? resolveAlertAction.bind(null, alert.id)
                        : reopenAlertAction.bind(null, alert.id)
                    }
                  >
                    <button
                      type="submit"
                      className={`text-sm px-3 py-1.5 rounded-md border shrink-0 transition-colors ${
                        alert.status === "OPEN"
                          ? "border-green-800 text-green-400 hover:bg-green-950/40"
                          : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                      }`}
                    >
                      {alert.status === "OPEN" ? "Mark restocked" : "Reopen"}
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
