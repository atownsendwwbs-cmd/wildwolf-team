"use client";

import { useActionState, useRef } from "react";
import { createUserAction, type AdminFormState } from "@/lib/actions/admin";

const initialState: AdminFormState = {};

export default function AddUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 flex flex-wrap items-end gap-3"
    >
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">Name</label>
        <input
          type="text"
          name="name"
          required
          placeholder="Full name"
          className="rounded-lg bg-neutral-950 border border-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">PIN</label>
        <input
          type="text"
          name="pin"
          inputMode="numeric"
          required
          maxLength={8}
          placeholder="4-8 digits"
          className="rounded-lg bg-neutral-950 border border-neutral-700 text-white px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">Role</label>
        <select
          name="role"
          defaultValue="EMPLOYEE"
          className="rounded-lg bg-neutral-950 border border-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="EMPLOYEE">Employee</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
      >
        {pending ? "Adding…" : "Add person"}
      </button>
      {state.error && <p className="text-sm text-red-400 basis-full">{state.error}</p>}
      {state.success && <p className="text-sm text-green-400 basis-full">{state.success}</p>}
    </form>
  );
}
