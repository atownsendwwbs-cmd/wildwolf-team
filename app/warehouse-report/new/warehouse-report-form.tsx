"use client";

import { useActionState } from "react";
import { createWarehouseReportAction, type WarehouseReportFormState } from "@/lib/actions/warehouse-report";

const initialState: WarehouseReportFormState = {};

export default function WarehouseReportForm() {
  const [state, formAction, pending] = useActionState(createWarehouseReportAction, initialState);

  return (
    <form action={formAction} className="space-y-8 max-w-3xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Shipments received today <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          name="shipments"
          rows={3}
          placeholder="What came in — supplier, what it was, anything notable"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Rack / product location changes <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          name="rackChanges"
          rows={3}
          placeholder="Anything moved, reorganized, or repositioned in the racks"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Cleaning <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          name="cleaning"
          rows={3}
          placeholder="What got cleaned or organized today"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Anything else worth flagging <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Anything big that happened today that doesn't fit above"
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
