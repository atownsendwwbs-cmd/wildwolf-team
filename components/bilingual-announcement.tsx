"use client";

import { useState } from "react";
import type { Lang } from "@/lib/generated/prisma/enums";

type Props = {
  messageEn: string;
  messageEs: string;
  sourceLang: Lang;
  translated: boolean;
  defaultLang?: Lang;
};

export default function BilingualAnnouncement({
  messageEn,
  messageEs,
  sourceLang,
  translated,
  defaultLang,
}: Props) {
  const [lang, setLang] = useState<Lang>(defaultLang ?? sourceLang);
  const message = lang === "EN" ? messageEn : messageEs;
  const showTranslationNotice = lang !== sourceLang && !translated;

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <p className="text-black whitespace-pre-wrap">{message}</p>
        <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden shrink-0">
          {(["EN", "ES"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={`px-2 py-0.5 text-[11px] font-semibold transition-colors ${
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
        <p className="text-xs text-amber-400 mt-1">
          {lang === "EN"
            ? "Auto-translation unavailable — showing the original text."
            : "Traducción automática no disponible — mostrando el texto original."}
        </p>
      )}
    </div>
  );
}
