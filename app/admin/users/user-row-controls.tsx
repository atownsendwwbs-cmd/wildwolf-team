"use client";

import { useState, useTransition } from "react";
import {
  resetPinAction,
  setUserActiveAction,
  setUserRoleAction,
} from "@/lib/actions/admin";

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

export function ResetPinControl({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-orange-400 hover:text-orange-300 font-medium"
      >
        Reset PIN
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={8}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        placeholder="New PIN"
        className="w-24 rounded-md bg-neutral-900 border border-neutral-700 text-white text-sm px-2 py-1.5"
      />
      <button
        type="button"
        disabled={pending || pin.length < 4}
        onClick={() => {
          startTransition(async () => {
            const result = await resetPinAction(userId, pin);
            setMessage(result.error ?? result.success ?? null);
            if (!result.error) {
              setPin("");
              setOpen(false);
            }
          });
        }}
        className="text-sm px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-medium"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setMessage(null);
        }}
        className="text-sm text-neutral-500 hover:text-neutral-300"
      >
        Cancel
      </button>
      {message && <span className="text-xs text-red-400">{message}</span>}
    </div>
  );
}
