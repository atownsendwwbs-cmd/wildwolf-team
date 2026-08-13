"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import BilingualAnnouncement from "@/components/bilingual-announcement";
import ReactionBar from "@/components/reaction-bar";
import { editAnnouncementAction, type AnnouncementFormState } from "@/lib/actions/announcements";
import type { Lang } from "@/lib/generated/prisma/enums";

type Reaction = { emoji: string; count: number; reacted: boolean };

const initialState: AnnouncementFormState = {};

export default function AnnouncementItem({
  id,
  messageEn,
  messageEs,
  sourceLang,
  translated,
  editedAt,
  authorName,
  createdAtLabel,
  defaultLang,
  canEdit,
  canReact,
  reactions,
}: {
  id: string;
  messageEn: string;
  messageEs: string;
  sourceLang: Lang;
  translated: boolean;
  editedAt: Date | null;
  authorName: string;
  createdAtLabel: string;
  defaultLang?: Lang;
  canEdit: boolean;
  canReact: boolean;
  reactions: Reaction[];
}) {
  const [editing, setEditing] = useState(false);
  const [sourceLangDraft, setSourceLangDraft] = useState<"EN" | "ES">(sourceLang);
  const editAction = editAnnouncementAction.bind(null, id);
  const [state, formAction, pending] = useActionState(editAction, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      setEditing(false);
    }
    wasPending.current = pending;
  }, [pending, state.error]);

  if (editing) {
    return (
      <form
        action={(formData) => {
          formAction(formData);
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="inline-flex rounded-md border border-neutral-700 overflow-hidden">
            {(["EN", "ES"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSourceLangDraft(lang)}
                className={`px-2.5 py-1 text-xs font-semibold transition-colors ${
                  sourceLangDraft === lang
                    ? "bg-orange-600 text-white"
                    : "bg-neutral-900 text-neutral-400 hover:text-black"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-neutral-500 hover:text-black"
          >
            Cancel
          </button>
        </div>
        <input type="hidden" name="sourceLang" value={sourceLangDraft} />
        <textarea
          name="message"
          rows={2}
          required
          defaultValue={sourceLang === "EN" ? messageEn : messageEs}
          className="w-full rounded-lg bg-neutral-950 border border-neutral-700 text-black px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {state.error && <p className="text-sm text-red-400 mt-1.5">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-md bg-orange-600 hover:bg-orange-500 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 transition-colors"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <BilingualAnnouncement
            messageEn={messageEn}
            messageEs={messageEs}
            sourceLang={sourceLang}
            translated={translated}
            defaultLang={defaultLang}
          />
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-orange-400 hover:text-orange-300 font-medium shrink-0"
          >
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-500 mt-1.5">
        {authorName} · {createdAtLabel}
        {editedAt && <> · edited</>}
      </p>
      <ReactionBar messageType="ANNOUNCEMENT" messageId={id} reactions={reactions} canReact={canReact} />
    </>
  );
}
