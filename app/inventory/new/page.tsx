import AppShell from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import AlertForm from "./alert-form";

export default async function NewAlertPage() {
  await requireUser();

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">Report a low item</h1>
      <AlertForm />
    </AppShell>
  );
}
