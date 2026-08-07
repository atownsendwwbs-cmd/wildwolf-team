"use client";

import { useActionState, useState } from "react";
import { createAlertAction, type AlertFormState } from "@/lib/actions/inventory";
import { COMMON_SUPPLIES } from "@/lib/constants";

const initialState: AlertFormState = {};

const CATEGORIES = [
  { value: "FINISHED_GOOD", label: "Finished good" },
  { value: "RAW_MATERIAL", label: "Raw material" },
  { value: "SUPPLY", label: "Warehouse supply (boxes, tape, gloves, etc.)" },
];

export default function AlertForm() {
  const [state, formAction, pending] = useActionState(createAlertAction, initialState);
  const [category, setCategory] = useState("SUPPLY");
  const [itemName, setItemName] = useState("");

  return (
    <form action={formAction} className="space-y-5 max-w-xl">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Category</label>
        <div className="grid grid-cols-1 gap-2">
          {CATEGORIES.map((c) => (
            <label
              key={c.value}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer ${
                category === c.value
                  ? "border-orange-600 bg-orange-950/30"
                  : "border-neutral-700 bg-neutral-900"
              }`}
            >
              <input
                type="radio"
                name="category"
                value={c.value}
                checked={category === c.value}
                onChange={() => setCategory(c.value)}
                className="accent-orange-600"
              />
              <span className="text-sm text-neutral-200">{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {category === "SUPPLY" && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Quick pick</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SUPPLIES.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setItemName(s)}
                className={`text-sm px-3 py-1.5 rounded-md border transition-colors ${
                  itemName === s
                    ? "border-orange-600 bg-orange-950/40 text-orange-300"
                    : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Item name</label>
        <input
          type="text"
          name="itemName"
          required
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="e.g. Large shipping boxes"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">Urgency</label>
        <select
          name="urgency"
          defaultValue="MEDIUM"
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="LOW">Low — worth noting</option>
          <option value="MEDIUM">Medium — order soon</option>
          <option value="HIGH">High — need it now</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Notes <span className="text-neutral-500">(optional)</span>
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="How much is left, where it's stored, preferred supplier, etc."
          className="w-full rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500"
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
        {pending ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
