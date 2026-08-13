"use client";

import { useActionState } from "react";
import { createEodReportAction, type EodFormState } from "@/lib/actions/eod";
import LineItemEditor from "./line-item-editor";

const initialState: EodFormState = {};

export default function EodForm() {
  const [state, formAction, pending] = useActionState(createEodReportAction, initialState);

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          What was packed today
        </label>
        <LineItemEditor
          fieldPrefix="packed"
          labelPlaceholder="Product / SKU"
          detailPlaceholder="Notes (optional)"
          addButtonLabel="Add packed item"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          What was sorted out / rejected — and why
        </label>
        <LineItemEditor
          fieldPrefix="sorted"
          labelPlaceholder="Item"
          detailPlaceholder="Reason (e.g. damaged, wrong label)"
          addButtonLabel="Add sorted item"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Where they left off
        </label>
        <textarea
          name="leftOff"
          rows={3}
          placeholder="e.g. Mid-way through the 500-unit run for Work Order #123, resume at station 2"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Notes for the day <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={4}
          placeholder="Anything else worth flagging — equipment issues, staffing, delays..."
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
        {pending ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
