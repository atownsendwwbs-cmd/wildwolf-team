import AppShell from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import EodForm from "./eod-form";

export default async function NewEodPage() {
  await requireUser();

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">End of day report</h1>
      <EodForm />
    </AppShell>
  );
}
