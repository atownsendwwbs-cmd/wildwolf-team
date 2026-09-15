import AppShell from "@/components/app-shell";
import { requireUser } from "@/lib/auth";
import WarehouseReportForm from "./warehouse-report-form";

export default async function NewWarehouseReportPage() {
  await requireUser();

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-2">Warehouse report</h1>
      <p className="text-sm text-neutral-500 mb-6">
        A quick summary of the important things from today — shipments, rack changes, cleaning, anything
        big that happened.
      </p>
      <WarehouseReportForm />
    </AppShell>
  );
}
