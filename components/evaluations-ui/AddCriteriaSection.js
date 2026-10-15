"use client";

import { Plus } from "lucide-react";

export default function AddCriteriaSection({ newSection, setNewSection, addSection }) {
  return (
    <>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:flex-row">
        <input
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSection()}
          placeholder="New section title (e.g. Communication Skills)"
          className="flex-1 rounded-lg border border-border bg-card px-3 sm:px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 sm:px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Section
        </button>
      </div>
      <p className="-mt-3 text-xs text-muted-foreground">
        A new section is only saved once you add its first criterion below.
      </p>
    </>
  );
}
