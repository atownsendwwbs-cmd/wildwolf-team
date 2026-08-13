"use client";

import { useActionState, useRef, useState } from "react";
import { createAnnouncementAction, type AnnouncementFormState } from "@/lib/actions/announcements";

const initialState: AnnouncementFormState = {};

const COPY = {
  EN: {
    label: "Post an announcement",
    placeholder: "Everyone gets this instantly — keep it short.",
    submit: "Post",
    submitting: "Posting…",
  },
  ES: {
    label: "Publicar un anuncio",
    placeholder: "Todos lo reciben al instante — sé breve.",
    submit: "Publicar",
    submitting: "Publicando…",
  },
} as const;

export default function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(createAnnouncementAction, initialState);
  const [sourceLang, setSourceLang] = useState<"EN" | "ES">("EN");
  const formRef = useRef<HTMLFormElement>(null);
  const c = COPY[sourceLang];

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
      }}
      className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-neutral-300">{c.label}</label>
        <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden shrink-0">
          {(["EN", "ES"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSourceLang(lang)}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                sourceLang === lang
                  ? "bg-orange-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-black"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
      <input type="hidden" name="sourceLang" value={sourceLang} />
      <textarea
        name="message"
        rows={2}
        required
        placeholder={c.placeholder}
        className="w-full rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div className="flex items-center justify-between mt-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 transition-colors"
        >
          {pending ? c.submitting : c.submit}
        </button>
        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
      </div>
    </form>
  );
}
