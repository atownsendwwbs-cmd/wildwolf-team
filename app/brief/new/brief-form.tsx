"use client";

import { useActionState, useState } from "react";
import { createBriefAction, type BriefFormState } from "@/lib/actions/brief";

const initialState: BriefFormState = {};

export default function BriefForm() {
  const [state, formAction, pending] = useActionState(createBriefAction, initialState);
  const [sourceLang, setSourceLang] = useState<"EN" | "ES">("EN");

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Writing this brief in
        </label>
        <div className="inline-flex rounded-lg border border-neutral-700 overflow-hidden">
          {(["EN", "ES"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSourceLang(lang)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                sourceLang === lang
                  ? "bg-orange-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
              }`}
            >
              {lang === "EN" ? "English" : "Español"}
            </button>
          ))}
        </div>
        <input type="hidden" name="sourceLang" value={sourceLang} />
        <p className="text-xs text-neutral-500 mt-2">
          {sourceLang === "EN"
            ? "We'll auto-translate this to Spanish when it's posted."
            : "Lo traduciremos automáticamente al inglés al publicarlo."}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          {sourceLang === "EN" ? "Title" : "Título"}
        </label>
        <input
          type="text"
          name="title"
          required
          placeholder={
            sourceLang === "EN" ? "e.g. Tuesday, Aug 7 — Priorities" : "p. ej. Martes 7 de agosto — Prioridades"
          }
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          {sourceLang === "EN"
            ? "What the team needs to know today"
            : "Lo que el equipo necesita saber hoy"}
        </label>
        <textarea
          name="content"
          required
          rows={12}
          placeholder={
            sourceLang === "EN"
              ? "Priorities for today...\nWork orders to focus on...\nAnything the team should watch out for..."
              : "Prioridades de hoy...\nÓrdenes de trabajo en las que enfocarse...\nCualquier cosa que el equipo deba tener en cuenta..."
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
        {pending ? "Posting…" : sourceLang === "EN" ? "Post brief" : "Publicar aviso"}
      </button>
    </form>
  );
}
