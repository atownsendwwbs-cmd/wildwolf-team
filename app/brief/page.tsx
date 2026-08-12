import Link from "next/link";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default async function BriefListPage() {
  const user = await getCurrentUser();
  const canPost = !!user && MANAGER_ROLES.includes(user.role);

  const briefs = await db.dailyBrief.findMany({
    orderBy: { date: "desc" },
    include: { author: { select: { name: true } } },
    take: 60,
  });

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Daily Briefs</h1>
        {canPost && (
          <Link
            href="/brief/new"
            className="rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            + New brief
          </Link>
        )}
      </div>

      {briefs.length === 0 ? (
        <p className="text-neutral-400">No daily briefs posted yet.</p>
      ) : (
        <ul className="space-y-3">
          {briefs.map((brief) => (
            <li key={brief.id}>
              <Link
                href={`/brief/${brief.id}`}
                className="block rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-white">{brief.titleEn}</h2>
                    <span className="text-[10px] font-semibold text-neutral-500 border border-neutral-700 rounded px-1.5 py-0.5">
                      EN/ES
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 shrink-0">
                    {formatDateTime(brief.date)}
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mt-1 line-clamp-2 whitespace-pre-wrap">
                  {brief.introEn}
                </p>
                <p className="text-xs text-neutral-500 mt-2">by {brief.author.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
