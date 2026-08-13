"use client";

import { useState } from "react";
import type { Lang } from "@/lib/generated/prisma/enums";
import { SALES_CHANNELS, parseProduction } from "@/lib/brief";

type Props = {
  titleEn: string;
  titleEs: string;
  introEn: string;
  introEs: string;
  productionEn: string;
  productionEs: string;
  packingEn: string;
  packingEs: string;
  specialEn: string;
  specialEs: string;
  sourceLang: Lang;
  translated: boolean;
  size?: "hero" | "normal";
  // Language to show first — defaults to the brief's own source language,
  // but pass the signed-in viewer's preference to show it their way instead.
  defaultLang?: Lang;
};

const LABELS = {
  EN: {
    eyebrow: "Daily Brief",
    intro: "Overview",
    production: "Production",
    packing: "Order Packing",
    special: "Special Projects & Announcements",
    other: "Other",
  },
  ES: {
    eyebrow: "Aviso Diario",
    intro: "Resumen",
    production: "Producción",
    packing: "Empaque de Pedidos",
    special: "Proyectos Especiales y Anuncios",
    other: "Otro",
  },
} as const;

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 mb-1.5">
        {heading}
      </h3>
      {children}
    </div>
  );
}

export default function BilingualBrief({
  titleEn,
  titleEs,
  introEn,
  introEs,
  productionEn,
  productionEs,
  packingEn,
  packingEs,
  specialEn,
  specialEs,
  sourceLang,
  translated,
  size = "normal",
  defaultLang,
}: Props) {
  const [lang, setLang] = useState<Lang>(defaultLang ?? sourceLang);

  const title = lang === "EN" ? titleEn : titleEs;
  const intro = lang === "EN" ? introEn : introEs;
  const packing = lang === "EN" ? packingEn : packingEs;
  const special = lang === "EN" ? specialEn : specialEs;
  const production = parseProduction(lang === "EN" ? productionEn : productionEs);
  const showTranslationNotice = lang !== sourceLang && !translated;
  const t = LABELS[lang];

  const hasProduction = SALES_CHANNELS.some((c) => production[c.key].trim());
  const proseClass =
    size === "hero"
      ? "text-black whitespace-pre-wrap leading-relaxed text-base"
      : "text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed";

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-400">
          {t.eyebrow}
        </span>
        <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden shrink-0">
          {(["EN", "ES"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                lang === l
                  ? "bg-orange-600 text-white"
                  : "bg-neutral-900 text-neutral-400 hover:text-black"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {showTranslationNotice && (
        <p className="text-xs text-amber-400 mb-2">
          {lang === "EN"
            ? "Auto-translation unavailable — showing the original text."
            : "Traducción automática no disponible — mostrando el texto original."}
        </p>
      )}

      <h2 className={size === "hero" ? "text-2xl font-bold text-black" : "font-semibold text-black"}>
        {title}
      </h2>

      <div className={size === "hero" ? "mt-4 space-y-4" : "mt-2 space-y-3"}>
        {intro.trim() && (
          <Section heading={t.intro}>
            <p className={proseClass}>{intro}</p>
          </Section>
        )}

        {hasProduction && (
          <Section heading={t.production}>
            <dl className="space-y-1.5">
              {SALES_CHANNELS.map(
                (c) =>
                  production[c.key].trim() && (
                    <div key={c.key} className="flex gap-2">
                      <dt className="text-sm font-semibold text-neutral-300 shrink-0">
                        {c.key === "other" ? t.other : c.label}:
                      </dt>
                      <dd className={proseClass}>{production[c.key]}</dd>
                    </div>
                  )
              )}
            </dl>
          </Section>
        )}

        {packing.trim() && (
          <Section heading={t.packing}>
            <p className={proseClass}>{packing}</p>
          </Section>
        )}

        {special.trim() && (
          <Section heading={t.special}>
            <p className={proseClass}>{special}</p>
          </Section>
        )}
      </div>
    </div>
  );
}
