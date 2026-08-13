import AppShell from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import AddUserForm from "./add-user-form";
import { RoleSelect, ActiveToggle, NameEditor, ResetPinControl } from "./user-row-controls";

export default async function AdminUsersPage() {
  const currentUser = await requireRole(["ADMIN"]);

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">Team</h1>
      <p className="text-sm text-neutral-400 mb-6">
        Anyone can browse the app without signing in. People listed here with a PIN can sign in to
        post briefs, report inventory, submit end-of-day reports, or manage the team — so you know
        who did what. Deactivate someone to remove their sign-in access.
      </p>

      <div className="mb-6">
        <AddUserForm />
      </div>

      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Name</th>
              <th className="text-left px-4 py-2.5 font-medium">Role</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 font-medium">PIN</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-neutral-800">
                <td className="px-4 py-3">
                  <NameEditor userId={u.id} name={u.name} />
                  {u.id === currentUser.id && (
                    <span className="text-neutral-500 font-normal"> (you)</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <RoleSelect userId={u.id} role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <ActiveToggle userId={u.id} active={u.active} />
                </td>
                <td className="px-4 py-3">
                  <ResetPinControl userId={u.id} hasPin={!!u.pinHash} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
