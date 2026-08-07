"use client";

import { useActionState } from "react";
import { createBriefAction, type BriefFormState } from "@/lib/actions/brief";

const initialState: BriefFormState = {};

export default function BriefForm() {
  const [state, formAction, pending] = useActionState(createBriefAction, initialState);

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Title</label>
        <input
          type="text"
          name="title"
          required
          placeholder="e.g. Tuesday, Aug 7 — Priorities"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          What the team needs to know today
        </label>
        <textarea
          name="content"
          required
          rows={12}
          placeholder={
            "Priorities for today...\nWork orders to focus on...\nAnything the team should watch out for..."
          }
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed"
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
        className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 transition-colors"
      >
        {pending ? "Posting…" : "Post brief"}
      </button>
    </form>
  );
}
