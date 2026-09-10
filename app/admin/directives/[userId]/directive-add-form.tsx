"use client";

import { useActionState, useRef } from "react";
import { addDirectiveAction, type DirectiveFormState } from "@/lib/actions/directives";

const initialState: DirectiveFormState = {};

export default function DirectiveAddForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(addDirectiveAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="flex items-start gap-2"
    >
      <input type="hidden" name="userId" value={userId} />
      <input
        type="text"
        name="text"
        required
        maxLength={500}
        placeholder="e.g. Finish labeling the 12oz batch before lunch"
        className="flex-1 rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
      >
        {pending ? "Adding…" : "+ Add"}
      </button>
      {state.error && <p className="text-sm text-red-400 basis-full">{state.error}</p>}
    </form>
  );
}
