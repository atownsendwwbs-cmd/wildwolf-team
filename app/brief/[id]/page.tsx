import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/app-shell";
import BilingualBrief from "@/components/bilingual-brief";
import ReactionBar from "@/components/reaction-bar";
import { db } from "@/lib/db";
import { getCurrentUser, MANAGER_ROLES } from "@/lib/auth";
import { getReactionSummaries } from "@/lib/reactions";
import { formatDateTime } from "@/lib/format";

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [brief, user] = await Promise.all([
    db.dailyBrief.findUnique({
      where: { id },
      include: { author: { select: { name: true } } },
    }),
    getCurrentUser(),
  ]);

  if (!brief) notFound();

  const reactions = await getReactionSummaries("BRIEF", [brief.id], user?.id ?? null);
  const canEdit = !!user && (user.id === brief.authorId || MANAGER_ROLES.includes(user.role));

  return (
    <AppShell>
      <article className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <p className="text-sm text-neutral-500">
            {formatDateTime(brief.date)} · by {brief.author.name}
            {brief.editedAt && <> · edited</>}
          </p>
          {canEdit && (
            <Link href={`/brief/${brief.id}/edit`} className="text-sm text-orange-400 hover:text-orange-300 font-medium shrink-0">
              Edit
            </Link>
          )}
        </div>
        <BilingualBrief
          titleEn={brief.titleEn}
          titleEs={brief.titleEs}
          introEn={brief.introEn}
          introEs={brief.introEs}
          productionEn={brief.productionEn}
          productionEs={brief.productionEs}
          packingEn={brief.packingEn}
          packingEs={brief.packingEs}
          specialEn={brief.specialEn}
          specialEs={brief.specialEs}
          sourceLang={brief.sourceLang}
          translated={brief.translated}
          defaultLang={user?.preferredLang}
          size="hero"
        />
        <ReactionBar
          messageType="BRIEF"
          messageId={brief.id}
          reactions={reactions[brief.id] ?? []}
          canReact={!!user}
        />
      </article>
    </AppShell>
  );
}
