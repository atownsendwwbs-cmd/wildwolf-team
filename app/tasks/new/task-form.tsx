"use client";

import { useActionState, useState } from "react";
import { createTaskAction, type TaskFormState } from "@/lib/actions/tasks";

const initialState: TaskFormState = {};

const fieldClass =
  "w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500";

type Target = "everyone" | "person" | "department";

export default function TaskForm({
  people,
  departments,
}: {
  people: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);
  const [target, setTarget] = useState<Target>("everyone");

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Assign to</label>
        <div className="inline-flex rounded-lg border border-neutral-700 overflow-hidden mb-3">
          {(
            [
              ["everyone", "Everyone"],
              ["person", "A person"],
              ["department", "A department"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTarget(value)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                target === value
                  ? "bg-orange-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {target === "person" && (
          <select name="assignedToId" defaultValue="" required className={fieldClass}>
            <option value="" disabled>
              Select a person
            </option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        {target === "department" && (
          <select name="departmentId" defaultValue="" required className={fieldClass}>
            <option value="" disabled>
              Select a department
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
            {departments.length === 0 && <option disabled>No departments yet — add one from Team</option>}
          </select>
        )}
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
