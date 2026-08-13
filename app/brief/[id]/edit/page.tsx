import { notFound } from "next/navigation";
import AppShell from "@/components/app-shell";
import BriefForm from "@/app/brief/new/brief-form";
import { editBriefAction } from "@/lib/actions/brief";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseProduction } from "@/lib/brief";

export default async function EditBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireRole(MANAGER_ROLES);

  const brief = await db.dailyBrief.findUnique({ where: { id } });
  if (!brief) notFound();
  if (brief.authorId !== user.id && !MANAGER_ROLES.includes(user.role)) {
    notFound();
  }

  const en = brief.sourceLang === "EN";

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">Edit brief</h1>
      <BriefForm
        action={editBriefAction.bind(null, id)}
        initial={{
          title: en ? brief.titleEn : brief.titleEs,
          sourceLang: brief.sourceLang,
          intro: en ? brief.introEn : brief.introEs,
          production: parseProduction(en ? brief.productionEn : brief.productionEs),
          packing: en ? brief.packingEn : brief.packingEs,
          special: en ? brief.specialEn : brief.specialEs,
        }}
      />
    </AppShell>
  );
}
