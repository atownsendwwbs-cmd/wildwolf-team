"use client";

import { useState, useTransition } from "react";
import {
  renameUserAction,
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
      className="rounded-md bg-neutral-900 border border-neutral-700 text-black text-sm px-2 py-1.5 disabled:opacity-60"
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

export function NameEditor({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(name);
  const [displayName, setDisplayName] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setValue(displayName);
          setOpen(true);
        }}
        className="text-black font-medium hover:underline decoration-dotted underline-offset-4"
        title="Click to rename"
      >
        {displayName}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        className="w-36 rounded-md bg-neutral-950 border border-neutral-700 text-black text-sm px-2 py-1"
      />
      <button
        type="button"
        disabled={pending || !value.trim()}
        onClick={() => {
          startTransition(async () => {
            const result = await renameUserAction(userId, value);
            if (result.error) {
              setError(result.error);
            } else {
              setDisplayName(value.trim());
              setError(null);
              setOpen(false);
            }
          });
        }}
        className="text-sm px-2.5 py-1 rounded-md bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-medium"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setError(null);
        }}
        className="text-sm text-neutral-500 hover:text-neutral-300"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}

export function ResetPinControl({ userId, hasPin }: { userId: string; hasPin: boolean }) {
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-sm font-medium ${
          hasPin ? "text-orange-400 hover:text-orange-300" : "text-amber-400 hover:text-amber-300"
        }`}
      >
        {hasPin ? "Reset PIN" : "Set PIN"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
        placeholder="4-digit PIN"
        className="w-24 rounded-md bg-neutral-950 border border-neutral-700 text-black text-sm px-2 py-1.5"
      />
      <button
        type="button"
        disabled={pending || pin.length !== 4}
        onClick={() => {
          startTransition(async () => {
            const result = await resetPinAction(userId, pin);
            setMessage(result.error ?? null);
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
