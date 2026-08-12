"use client";

import { useActionState, useState } from "react";
import { createBriefAction, type BriefFormState } from "@/lib/actions/brief";
import { SALES_CHANNELS } from "@/lib/brief";

const initialState: BriefFormState = {};

const COPY = {
  EN: {
    langLabel: "Writing this brief in",
    translateNote: "We'll auto-translate this to Spanish when it's posted.",
    title: "Title",
    titlePlaceholder: "e.g. Tuesday, Aug 12",
    intro: "Overview",
    introHint: "A quick summary of the day",
    introPlaceholder: "What today's about, at a glance...",
    production: "Production",
    productionHint: "How production will go today, by sales channel",
    packing: "Order Packing",
    packingHint: "Quick announcements for the packing team: what's low, what to watch, new products",
    packingPlaceholder: "What's running low...\nWhat to watch closely while packing...\nAny new products to know about...",
    special: "Special Projects & Announcements",
    specialHint: "Anything else important — projects, reminders, announcements",
    specialPlaceholder: "Special projects for today...\nImportant reminders...",
    submit: "Post brief",
    submitting: "Posting…",
  },
  ES: {
    langLabel: "Escribiendo este aviso en",
    translateNote: "Lo traduciremos automáticamente al inglés al publicarlo.",
    title: "Título",
    titlePlaceholder: "p. ej. Martes 12 de agosto",
    intro: "Resumen",
    introHint: "Un resumen rápido del día",
    introPlaceholder: "De qué se trata hoy, en breve...",
    production: "Producción",
    productionHint: "Cómo irá la producción hoy, por canal de venta",
    packing: "Empaque de Pedidos",
    packingHint: "Anuncios rápidos para el equipo de empaque: qué está bajo, qué vigilar, productos nuevos",
    packingPlaceholder: "Qué está bajo...\nQué vigilar de cerca al empacar...\nProductos nuevos que deben saber...",
    special: "Proyectos Especiales y Anuncios",
    specialHint: "Cualquier otra cosa importante — proyectos, recordatorios, anuncios",
    specialPlaceholder: "Proyectos especiales de hoy...\nRecordatorios importantes...",
    submit: "Publicar aviso",
    submitting: "Publicando…",
  },
} as const;

const fieldClass =
  "w-full rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 leading-relaxed";

export default function BriefForm() {
  const [state, formAction, pending] = useActionState(createBriefAction, initialState);
  const [sourceLang, setSourceLang] = useState<"EN" | "ES">("EN");
  const c = COPY[sourceLang];

  return (
    <form action={formAction} className="space-y-8 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">{c.langLabel}</label>
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
        <p className="text-xs text-neutral-500 mt-2">{c.translateNote}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">{c.title}</label>
        <input type="text" name="title" required placeholder={c.titlePlaceholder} className={fieldClass} />
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-white">{c.intro}</h3>
        <p className="text-xs text-neutral-500 mb-2">{c.introHint}</p>
        <textarea name="intro" rows={3} placeholder={c.introPlaceholder} className={fieldClass} />
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-white">{c.production}</h3>
        <p className="text-xs text-neutral-500 mb-3">{c.productionHint}</p>
        <div className="space-y-3">
          {SALES_CHANNELS.map((channel) => (
            <div key={channel.key}>
              <label className="block text-xs font-medium text-neutral-400 mb-1">
                {channel.label}
              </label>
              <textarea
                name={`production${channel.key[0].toUpperCase()}${channel.key.slice(1)}`}
                rows={2}
                className={fieldClass}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-white">{c.packing}</h3>
        <p className="text-xs text-neutral-500 mb-2">{c.packingHint}</p>
        <textarea name="packing" rows={4} placeholder={c.packingPlaceholder} className={fieldClass} />
      </div>

      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-white">{c.special}</h3>
        <p className="text-xs text-neutral-500 mb-2">{c.specialHint}</p>
        <textarea name="special" rows={4} placeholder={c.specialPlaceholder} className={fieldClass} />
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
        {pending ? c.submitting : c.submit}
      </button>
    </form>
  );
}
