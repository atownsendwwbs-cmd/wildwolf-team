"use client";

import { useState, useTransition } from "react";
import { toggleReactionAction } from "@/lib/actions/reactions";
import type { ReactionTarget } from "@/lib/generated/prisma/enums";

const PICKER_EMOJI = ["👍", "❤️", "😂", "🎉", "👀", "✅"];

type Reaction = { emoji: string; count: number; reacted: boolean };

export default function ReactionBar({
  messageType,
  messageId,
  reactions,
  canReact,
}: {
  messageType: ReactionTarget;
  messageId: string;
  reactions: Reaction[];
  canReact: boolean;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!canReact && reactions.length === 0) return null;

  function toggle(emoji: string) {
    setPickerOpen(false);
    startTransition(() => {
      toggleReactionAction(messageType, messageId, emoji);
    });
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-2">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          disabled={!canReact || pending}
          onClick={() => toggle(r.emoji)}
          className={`text-xs px-2 py-0.5 rounded-full border transition-colors disabled:cursor-default ${
            r.reacted
              ? "border-orange-600 bg-orange-950/30 text-orange-600"
              : "border-neutral-700 text-neutral-400 hover:bg-neutral-800"
          }`}
        >
          {r.emoji} {r.count}
        </button>
      ))}
      {canReact && (
        <div className="relative">
          <button
            type="button"
            disabled={pending}
            onClick={() => setPickerOpen((v) => !v)}
            className="text-xs px-2 py-0.5 rounded-full border border-neutral-700 text-neutral-400 hover:bg-neutral-800 transition-colors disabled:opacity-60"
            aria-label="Add reaction"
          >
            + 🙂
          </button>
          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
              <div className="absolute z-20 bottom-full mb-1 left-0 flex gap-1 rounded-lg border border-neutral-700 bg-neutral-900 p-1.5 shadow-lg">
                {PICKER_EMOJI.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => toggle(emoji)}
                    className="text-base w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-800 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
