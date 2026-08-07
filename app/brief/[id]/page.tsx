import { notFound } from "next/navigation";
import AppShell from "@/components/app-shell";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

export default async function BriefDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser();
  const { id } = await params;

  const brief = await db.dailyBrief.findUnique({
    where: { id },
    include: { author: { select: { name: true } } },
  });

  if (!brief) notFound();

  return (
    <AppShell>
      <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
        <h1 className="text-xl font-bold text-white">{brief.title}</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {formatDateTime(brief.date)} · by {brief.author.name}
        </p>
        <div className="mt-4 text-neutral-200 whitespace-pre-wrap leading-relaxed">
          {brief.content}
        </div>
      </article>
    </AppShell>
  );
}
