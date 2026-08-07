"use client";

import { useState, useTransition } from "react";
import { setUserActiveAction, setUserRoleAction } from "@/lib/actions/admin";

type Role = "ADMIN" | "MANAGER" | "EMPLOYEE";

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [value, setValue] = useState(role);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as Role;
        setValue(next);
        startTransition(() => {
          setUserRoleAction(userId, next);
        });
      }}
      className="rounded-md bg-neutral-900 border border-neutral-700 text-white text-sm px-2 py-1.5 disabled:opacity-60"
    >
      <option value="EMPLOYEE">Employee</option>
      <option value="MANAGER">Manager</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}

export function ActiveToggle({ userId, active }: { userId: string; active: boolean }) {
  const [value, setValue] = useState(active);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        const next = !value;
        setValue(next);
        startTransition(() => {
          setUserActiveAction(userId, next);
        });
      }}
      className={`text-sm px-3 py-1.5 rounded-md border transition-colors disabled:opacity-60 ${
        value
          ? "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          : "border-red-800 text-red-400 hover:bg-red-950/40"
      }`}
    >
      {value ? "Active" : "Deactivated"}
    </button>
  );
}
