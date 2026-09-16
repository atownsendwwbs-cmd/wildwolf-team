"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTimeOffRequestAction, type TimeOffFormState } from "@/lib/actions/time-off";

const initialState: TimeOffFormState = {};

export default function TimeOffForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState(createTimeOffRequestAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      // Reset back to defaults (which keeps the name filled in for next time)
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Name</label>
        <input
          type="text"
          name="name"
          required
          maxLength={200}
          defaultValue={defaultName}
          placeholder="Full name"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Date</label>
        <input
          type="date"
          name="date"
          required
          className="rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Time</label>
        <input
          type="text"
          name="timeNote"
          required
          maxLength={200}
          placeholder="e.g. Leaving at 2pm, coming in around 10am, all day"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Return date <span className="text-neutral-500">(when they&apos;ll be back — same day is fine for a one-day absence)</span>
        </label>
        <input
          type="date"
          name="returnDate"
          required
          className="rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Reason</label>
        <input
          type="text"
          name="reason"
          required
          maxLength={300}
          placeholder="e.g. Sick, family emergency, doctor's appointment"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Additional information <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-green-400 bg-green-950/40 border border-green-900 rounded-lg px-3 py-2">
          Reported — thanks for letting us know.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 transition-colors"
      >
        {pending ? "Submitting…" : "Submit"}
      </button>
    </form>
  );
}
