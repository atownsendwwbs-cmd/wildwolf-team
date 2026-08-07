"use client";

import { useState } from "react";
import type { Lang } from "@/lib/generated/prisma/enums";

type Props = {
  titleEn: string;
  contentEn: string;
  titleEs: string;
  contentEs: string;
  sourceLang: Lang;
  translated: boolean;
  size?: "hero" | "normal";
};

export default function BilingualBrief({
  titleEn,
  contentEn,
  titleEs,
  contentEs,
  sourceLang,
  translated,
  size = "normal",
}: Props) {
  const [lang, setLang] = useState<Lang>(sourceLang);

  const title = lang === "EN" ? titleEn : titleEs;
  const content = lang === "EN" ? contentEn : contentEs;
  const showTranslationNotice = lang !== sourceLang && !translated;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-orange-400">
          {lang === "EN" ? "Daily Brief" : "Aviso Diario"}
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
                  : "bg-neutral-900 text-neutral-400 hover:text-white"
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

      <h2 className={size === "hero" ? "text-2xl font-bold text-white" : "font-semibold text-white"}>
        {title}
      </h2>
      <div
        className={
          size === "hero"
            ? "mt-3 text-neutral-200 whitespace-pre-wrap leading-relaxed text-base"
            : "mt-1 text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed"
        }
      >
        {content}
      </div>
    </div>
  );
}
