"use client";

import RecordsNarrative from "../weekly-narratives-ui/RecordsNarratives";

export default function RecordNarrativesTab({ data }) {
  return (
    <ul className="space-y-3 sm:space-y-4">
      {(data?.narratives || []).map((narrative) => (
        <RecordsNarrative
          key={`${narrative.id}-${narrative.updated_at || narrative.created_at}`}
          narrative={narrative}
        />
      ))}

      {(!data?.narratives || data.narratives.length === 0) && (
        <li className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <p className="text-sm text-muted-foreground">
            No narratives yet.
          </p>
        </li>
      )}
    </ul>
  );
}
