"use client";

import { useActionState, useRef, useTransition } from "react";
import {
  createDepartmentAction,
  deleteDepartmentAction,
  type AdminFormState,
} from "@/lib/actions/admin";

const initialState: AdminFormState = {};

export default function DepartmentManager({
  departments,
}: {
  departments: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createDepartmentAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [deletePending, startDelete] = useTransition();

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="text-sm font-bold text-black uppercase tracking-wide mb-1">Departments</h2>
      <p className="text-xs text-neutral-500 mb-3">
        Non-person task categories like Production or Bag Labeling — assign people to one, then
        tasks can go to the whole department instead of a single name.
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {departments.length === 0 ? (
          <p className="text-sm text-neutral-500">No departments yet.</p>
        ) : (
          departments.map((d) => (
            <span
              key={d.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-950 pl-2.5 pr-1.5 py-1 text-sm text-black"
            >
              {d.name}
              <button
                type="button"
                disabled={deletePending}
                onClick={() => startDelete(() => deleteDepartmentAction(d.id))}
                className="text-neutral-500 hover:text-red-400 disabled:opacity-60"
                aria-label={`Remove ${d.name}`}
              >
                ✕
              </button>
            </span>
          ))
        )}
      </div>
      <form
        ref={formRef}
        action={(formData) => {
          formAction(formData);
          formRef.current?.reset();
        }}
        className="flex items-end gap-2"
      >
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1">New department</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Production"
            className="rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </form>
      {state.error && <p className="text-sm text-red-400 mt-2">{state.error}</p>}
    </div>
  );
}
