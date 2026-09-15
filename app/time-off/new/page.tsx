import AppShell from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth";
import TimeOffForm from "./time-off-form";

export default async function NewTimeOffPage() {
  const user = await getCurrentUser();

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-2">Report time off / an absence</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Leaving early, coming in late, sick, or can&apos;t make it in — let us know here. You don&apos;t
        need to be signed in to submit this.
      </p>
      <TimeOffForm defaultName={user?.name ?? ""} />
    </AppShell>
  );
}
