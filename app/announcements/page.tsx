import AppShell from "@/components/app-shell";
import AnnouncementItem from "@/components/announcement-item";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { getReactionSummaries } from "@/lib/reactions";
import { formatDateTime } from "@/lib/format";
import AnnouncementForm from "./announcement-form";

export default async function AnnouncementsPage() {
  const user = await getCurrentUser();
  const canPost = !!user && MANAGER_ROLES.includes(user.role);

  const [announcements, people] = await Promise.all([
    db.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { author: { select: { name: true } } },
    }),
    db.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const reactionsByMessage = await getReactionSummaries(
    "ANNOUNCEMENT",
    announcements.map((a) => a.id),
    user?.id ?? null
  );

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">Announcements</h1>

      {canPost && (
        <div className="mb-6">
          <AnnouncementForm people={people.filter((p) => p.id !== user?.id)} />
        </div>
      )}

      {announcements.length === 0 ? (
        <p className="text-neutral-400">No announcements yet.</p>
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li key={a.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <AnnouncementItem
                id={a.id}
                messageEn={a.messageEn}
                messageEs={a.messageEs}
                sourceLang={a.sourceLang}
                translated={a.translated}
                editedAt={a.editedAt}
                authorName={a.author.name}
                createdAtLabel={formatDateTime(a.createdAt)}
                defaultLang={user?.preferredLang}
                canEdit={!!user && (user.id === a.authorId || MANAGER_ROLES.includes(user.role))}
                canReact={!!user}
                reactions={reactionsByMessage[a.id] ?? []}
              />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
