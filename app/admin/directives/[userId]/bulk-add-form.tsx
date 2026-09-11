"use client";

import { useActionState, useRef } from "react";
import { bulkAddDirectivesAction, type BulkDirectiveFormState } from "@/lib/actions/directives";

const initialState: BulkDirectiveFormState = {};

const PLACEHOLDER = `Section: Morning Tasks
1. First thing to do when you arrive...
2. Second thing...

Section: Reporting
3. Report anything low right away...`;

export default function BulkAddForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(bulkAddDirectivesAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 space-y-2 mb-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <label className="block text-xs font-medium text-neutral-400">Paste a whole list at once</label>
      <textarea
        name="block"
        rows={8}
        placeholder={PLACEHOLDER}
        className="w-full rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <p className="text-xs text-neutral-500">
        Start a section with a line like <code className="text-neutral-400">Section: Morning Tasks</code>,
        then list items under it as <code className="text-neutral-400">1. ...</code> or{" "}
        <code className="text-neutral-400">- ...</code>. This only adds — it never removes or replaces
        what&apos;s already there.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
      >
        {pending ? "Importing…" : "Import list"}
      </button>
      {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      {state.success && <p className="text-sm text-green-400">{state.success}</p>}
    </form>
  );
}
