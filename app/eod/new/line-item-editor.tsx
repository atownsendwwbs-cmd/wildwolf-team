"use client";

import { useState } from "react";

type Row = { id: number; label: string; quantity: string; detail: string };

let nextId = 1;

export default function LineItemEditor({
  fieldPrefix,
  labelPlaceholder,
  detailPlaceholder,
  addButtonLabel,
}: {
  fieldPrefix: string;
  labelPlaceholder: string;
  detailPlaceholder: string;
  addButtonLabel: string;
}) {
  const [rows, setRows] = useState<Row[]>([{ id: nextId++, label: "", quantity: "", detail: "" }]);

  function updateRow(id: number, field: keyof Row, value: string) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { id: nextId++, label: "", quantity: "", detail: "" }]);
  }

  function removeRow(id: number) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="flex gap-2 items-start">
          <input
            type="text"
            name={`${fieldPrefix}_label`}
            value={row.label}
            onChange={(e) => updateRow(row.id, "label", e.target.value)}
            placeholder={labelPlaceholder}
            className="flex-[3] min-w-0 rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name={`${fieldPrefix}_quantity`}
            value={row.quantity}
            onChange={(e) => updateRow(row.id, "quantity", e.target.value)}
            placeholder="Qty"
            className="flex-[1] min-w-0 rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            type="text"
            name={`${fieldPrefix}_detail`}
            value={row.detail}
            onChange={(e) => updateRow(row.id, "detail", e.target.value)}
            placeholder={detailPlaceholder}
            className="flex-[3] min-w-0 rounded-lg bg-neutral-900 border border-neutral-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={() => removeRow(row.id)}
            disabled={rows.length === 1}
            className="shrink-0 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 px-3 py-2 text-sm"
            aria-label="Remove row"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="text-sm text-orange-400 hover:text-orange-300 font-medium"
      >
        + {addButtonLabel}
      </button>
    </div>
  );
}
