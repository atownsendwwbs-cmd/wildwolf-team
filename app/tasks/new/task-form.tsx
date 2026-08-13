"use client";

import { useActionState } from "react";
import { createTaskAction, type TaskFormState } from "@/lib/actions/tasks";

const initialState: TaskFormState = {};

const fieldClass =
  "w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function TaskForm({ people }: { people: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Assign to</label>
        <select name="assignedToId" defaultValue="" className={fieldClass}>
          <option value="">Everyone</option>
          {people.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Task</label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Restock thermal labels at station 2"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Details <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea name="details" rows={3} className={fieldClass} />
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 transition-colors"
      >
        {pending ? "Assigning…" : "Assign task"}
      </button>
    </form>
  );
}
