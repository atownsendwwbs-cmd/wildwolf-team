import AppShell from "@/components/app-shell";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import AddUserForm from "./add-user-form";
import DepartmentManager from "./department-manager";
import { RoleSelect, ActiveToggle, NameEditor, ResetPinControl, DepartmentSelect } from "./user-row-controls";

export default async function AdminUsersPage() {
  const currentUser = await requireRole(["ADMIN"]);

  const [users, departments] = await Promise.all([
    db.user.findMany({ orderBy: { createdAt: "asc" } }),
    db.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <AppShell>
      <h1 className="text-xl font-bold text-black mb-6">Team</h1>
      <p className="text-sm text-neutral-400 mb-6">
        Anyone can browse the app without signing in. People with a PIN can sign in to post
        briefs, report inventory, submit end-of-day reports, or manage the team. People added
        without a PIN can still tap their name to sign in and turn on notifications — for
        @mentions and task pings — without unlocking any of that. Deactivate someone to remove
        their sign-in access entirely.
      </p>

      <div className="mb-6">
        <AddUserForm />
      </div>

      <div className="mb-6">
        <DepartmentManager departments={departments} />
      </div>

      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Name</th>
              <th className="text-left px-4 py-2.5 font-medium">Role</th>
              <th className="text-left px-4 py-2.5 font-medium">Department</th>
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
                  <DepartmentSelect userId={u.id} departmentId={u.departmentId} departments={departments} />
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
