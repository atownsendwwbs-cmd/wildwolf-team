"use client";

import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

type UserOption = { id: string; name: string; role: string };

const initialState: LoginState = {};

export default function LoginForm({ users }: { users: UserOption[] }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [selected, setSelected] = useState("");

  return (
    <form action={formAction} className="bg-neutral-900 rounded-lg p-6 space-y-5 border border-neutral-800">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Your name</label>
        <select
          name="userId"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          required
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 text-black px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="" disabled>
            Select your name
          </option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">PIN</label>
        <input
          type="password"
          name="pin"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          minLength={4}
          pattern="[0-9]{4}"
          required
          placeholder="4-digit PIN"
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 text-black px-3 py-3 text-base tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-semibold py-3 transition-colors"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
