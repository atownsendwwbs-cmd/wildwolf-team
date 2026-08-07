import AppShell from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import AddUserForm from "./add-user-form";
import { RoleSelect, ActiveToggle, ResetPinControl } from "./user-row-controls";

export default async function AdminUsersPage() {
  const currentUser = await requireRole(["ADMIN"]);

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-white mb-6">Team</h1>

      <div className="mb-6">
        <AddUserForm />
      </div>

      <div className="rounded-xl border border-neutral-800 overflow-hidden">
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
                <td className="px-4 py-3 text-white font-medium">
                  {u.name}
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
                  <ResetPinControl userId={u.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
