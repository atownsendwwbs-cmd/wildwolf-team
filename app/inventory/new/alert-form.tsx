"use client";

import { useActionState, useState } from "react";
import { createAlertAction, type AlertFormState } from "@/lib/actions/inventory";
import { COMMON_SUPPLIES } from "@/lib/constants";
import { BOX_SIZES, BOXES_ITEM_NAME, SIZED_SUPPLY_ITEMS } from "@/lib/inventory";

const initialState: AlertFormState = {};

const CATEGORIES = [
  { value: "FINISHED_GOOD", label: "Finished good" },
  { value: "RAW_MATERIAL", label: "Raw material" },
  { value: "SUPPLY", label: "Warehouse supply (boxes, tape, gloves, etc.)" },
];

const fieldClass =
  "w-full rounded-lg bg-neutral-900 border border-neutral-700 text-black px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500";

export default function AlertForm() {
  const [state, formAction, pending] = useActionState(createAlertAction, initialState);
  const [category, setCategory] = useState("SUPPLY");
  const [itemName, setItemName] = useState("");

  const needsBoxSize = category === "SUPPLY" && itemName === BOXES_ITEM_NAME;
  const needsSupplySize = category === "SUPPLY" && SIZED_SUPPLY_ITEMS.includes(itemName);

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
                onChange={() => {
                  setCategory(c.value);
                  setItemName("");
                }}
                className="accent-orange-600"
              />
              <span className="text-sm text-black">{c.label}</span>
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
          placeholder={
            category === "FINISHED_GOOD"
              ? "e.g. Wolf Mug 12oz"
              : category === "RAW_MATERIAL"
                ? "e.g. Kraft paper stuffing"
                : "e.g. Large shipping boxes"
          }
          className={fieldClass}
        />
      </div>

      {category === "FINISHED_GOOD" && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Stock level</label>
          <select name="stockLevel" defaultValue="" required className={fieldClass}>
            <option value="" disabled>
              Select a level
            </option>
            <option value="UNDER_100">Under 100 units</option>
            <option value="UNDER_50">Under 50 units</option>
            <option value="UNDER_25">Under 25 units</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
          </select>
        </div>
      )}

      {category === "RAW_MATERIAL" && (
        <>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-red-800 bg-red-950/20 px-3 py-2.5 cursor-pointer has-[:checked]:bg-red-950/50 has-[:checked]:border-red-600">
                <input type="radio" name="rawMaterialStatus" value="OUT" required className="accent-red-600" />
                <span className="text-sm text-red-300 font-medium">Out of material</span>
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-amber-800 bg-amber-950/20 px-3 py-2.5 cursor-pointer has-[:checked]:bg-amber-950/50 has-[:checked]:border-amber-600">
                <input type="radio" name="rawMaterialStatus" value="LOW" required className="accent-amber-600" />
                <span className="text-sm text-amber-300 font-medium">Low — more to pack</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">Amount left</label>
            <input
              type="text"
              name="quantity"
              required
              placeholder="e.g. 12 bags, 3 pallets, 450 lbs"
              className={fieldClass}
            />
          </div>
        </>
      )}

      {needsBoxSize && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Box size</label>
          <select name="boxSize" defaultValue="" required className={fieldClass}>
            <option value="" disabled>
              Select a size
            </option>
            {BOX_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {needsSupplySize && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Size</label>
          <input
            type="text"
            name="supplySize"
            required
            placeholder="e.g. 12x16, 5 gallon"
            className={fieldClass}
          />
        </div>
      )}

      {category === "SUPPLY" && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">Urgency</label>
          <select name="urgency" defaultValue="MEDIUM" required className={fieldClass}>
            <option value="LOW">Low — worth noting</option>
            <option value="MEDIUM">Medium — order soon</option>
            <option value="HIGH">High — need it now</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Notes
          {category === "RAW_MATERIAL" && (
            <span className="text-amber-400 font-normal"> (important — where it&apos;s stored, supplier, etc.)</span>
          )}
          {category !== "RAW_MATERIAL" && <span className="text-neutral-500"> (optional)</span>}
        </label>
        <textarea
          name="notes"
          rows={3}
          placeholder="How much is left, where it's stored, preferred supplier, etc."
          className={fieldClass}
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
