import { notFound } from "next/navigation";
import AppShell from "@/components/app-shell";
import BilingualBrief from "@/components/bilingual-brief";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const brief = await db.dailyBrief.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });

  if (!brief) notFound();

  return (
    <AppShell>
      <article className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
        <p className="text-sm text-neutral-500 mb-4">
          {formatDateTime(brief.date)} · by {brief.author.name}
        </p>
        <BilingualBrief
          titleEn={brief.titleEn}
          contentEn={brief.contentEn}
          titleEs={brief.titleEs}
          contentEs={brief.contentEs}
          sourceLang={brief.sourceLang}
          translated={brief.translated}
          size="hero"
        />
      </article>
    </AppShell>
  );
}
