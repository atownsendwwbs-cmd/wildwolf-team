import AppShell from "@/components/app-shell";
import { requireRole, MANAGER_ROLES } from "@/lib/auth";
import BriefForm from "./brief-form";

export default async function NewBriefPage() {
  await requireRole(MANAGER_ROLES);

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-white mb-6">Post today&apos;s brief</h1>
      <BriefForm />
    </AppShell>
  );
}
