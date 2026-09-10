"use client";

import { useActionState, useRef } from "react";
import { addProjectAction, type ProjectFormState } from "@/lib/actions/directives";

const initialState: ProjectFormState = {};

export default function ProjectAddForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(addProjectAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 space-y-3"
    >
      <input type="hidden" name="userId" value={userId} />
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">Title</label>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Reorganize the label shelf"
          className="w-full rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">
          Details <span className="text-neutral-600">(optional)</span>
        </label>
        <textarea
          name="details"
          rows={3}
          maxLength={4000}
          placeholder="Whatever you'd normally put in the Google Doc"
          className="w-full rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1">
          Due date <span className="text-neutral-600">(optional)</span>
        </label>
        <input
          type="date"
          name="dueDate"
          className="rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
      >
        {pending ? "Assigning…" : "+ Assign project"}
      </button>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
