"use client";

import { useActionState, useRef } from "react";
import { createAnnouncementAction, type AnnouncementFormState } from "@/lib/actions/announcements";

const initialState: AnnouncementFormState = {};

export default function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(createAnnouncementAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
    >
      <label className="block text-sm font-medium text-neutral-300 mb-2">
        Post an announcement
      </label>
      <textarea
        name="message"
        rows={2}
        required
        placeholder="Everyone gets this instantly — keep it short."
        className="w-full rounded-lg bg-neutral-950 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div className="flex items-center justify-between mt-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          {pending ? "Posting…" : "Post"}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
