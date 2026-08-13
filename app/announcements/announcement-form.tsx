"use client";

import { useActionState, useRef, useState } from "react";
import { createAnnouncementAction, type AnnouncementFormState } from "@/lib/actions/announcements";

const initialState: AnnouncementFormState = {};

const COPY = {
  EN: {
    label: "Post an announcement",
    placeholder: "Everyone gets this instantly — keep it short.",
    mention: "Mention:",
    submit: "Post",
    submitting: "Posting…",
  },
  ES: {
    label: "Publicar un anuncio",
    placeholder: "Todos lo reciben al instante — sé breve.",
    mention: "Mencionar:",
    submit: "Publicar",
    submitting: "Publicando…",
  },
} as const;

export default function AnnouncementForm({ people }: { people: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createAnnouncementAction, initialState);
  const [sourceLang, setSourceLang] = useState<"EN" | "ES">("EN");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const c = COPY[sourceLang];

  function insertMention(name: string) {
    const textarea = textareaRef.current;
    const mention = `@${name} `;
    if (!textarea) {
      setMessage((m) => m + mention);
      return;
    }
    const start = textarea.selectionStart ?? message.length;
    const end = textarea.selectionEnd ?? message.length;
    const next = message.slice(0, start) + mention + message.slice(end);
    setMessage(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const pos = start + mention.length;
      textarea.setSelectionRange(pos, pos);
    });
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        formAction(formData);
        formRef.current?.reset();
        setMessage("");
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
        ref={textareaRef}
        name="message"
        rows={2}
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={c.placeholder}
        className="w-full rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      {people.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs text-neutral-500">{c.mention}</span>
          {people.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => insertMention(p.name)}
              className="text-xs px-2 py-1 rounded-md border border-neutral-700 text-neutral-400 hover:text-black hover:border-orange-600 transition-colors"
            >
              @{p.name}
            </button>
          ))}
        </div>
      )}
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
