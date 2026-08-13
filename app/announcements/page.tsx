import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import AnnouncementForm from "./announcement-form";

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();
  const canPost = !!user && MANAGER_ROLES.includes(user.role);

  const announcements = await db.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: { select: { name: true } } },
  });

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-white mb-6">Announcements</h1>

      {canPost && (
        <div className="mb-6">
          <AnnouncementForm />
        </div>
      )}

      {announcements.length === 0 ? (
        <p className="text-neutral-400">No announcements yet.</p>
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <p className="text-white whitespace-pre-wrap">{a.message}</p>
              <p className="text-xs text-neutral-500 mt-2">
                {a.author.name} · {formatDateTime(a.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
