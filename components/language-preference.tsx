"use client";

import { useState, useTransition } from "react";
import { setPreferredLangAction } from "@/lib/actions/settings";
import type { Lang } from "@/lib/generated/prisma/enums";

export default function LanguagePreference({ initial }: { initial: Lang }) {
  const [lang, setLang] = useState<Lang>(initial);
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="inline-flex rounded-md border border-neutral-700 overflow-hidden shrink-0"
      title="Language you see briefs and announcements in"
    >
      {(["EN", "ES"] as const).map((l) => (
        <button
          key={l}
          type="button"
          disabled={pending}
          onClick={() => {
            setLang(l);
            startTransition(() => {
              setPreferredLangAction(l);
            });
          }}
          className={`px-2 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
            lang === l
              ? "bg-orange-600 text-white"
              : "bg-neutral-900 text-neutral-400 hover:text-black"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
