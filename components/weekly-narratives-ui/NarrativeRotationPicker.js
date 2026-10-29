"use client";

import SelectionRowsSkeleton from "@/components/skeletons/SelectionRowsSkeleton";
import { useState } from "react";
import useInternshipRotations from "@/lib/hooks/useInternshipRotations";
import { rotationDate, rotationSnapshots, suggestedRotations } from "@/lib/internship-rotations.mjs";
import NarrativeRotations from "./NarrativeRotations";

// Suggest every overlapping assignment, including weeks spanning two company units.
// Store only chosen IDs in the form; the backend builds authoritative saved snapshots.
export default function NarrativeRotationPicker({ internshipId, data, from, to, disabled }) {
  const query = useInternshipRotations(internshipId);
  const saved = rotationSnapshots(data?.rotation_assignments);
  const [selection, setSelection] = useState(() => data ? { range: `${data.date_from}|${data.date_to}`, ids: saved.map(row => row.id) } : null);
  if (!internshipId) return null;
  if (query.isPending || query.isError) return <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground" role="status">
    {query.isError ? <>Could not load company assignments. <button type="button" className="text-primary-emphasis underline" onClick={() => void query.refetch()}>Try again</button></> : <SelectionRowsSkeleton label="Loading company assignments" rows={2} />}
    <input type="hidden" required value="" readOnly data-validation-label="Wait for company rotations to load, or retry the request" />
  </div>;
  if (!query.data.enabled) return saved.length ? <><p className="text-xs text-muted-foreground">Saved company assignments (rotation tracking is off)</p><NarrativeRotations narrative={data} /></> : null;
  const sameCoverage = data?.date_from === from && data?.date_to === to;
  const available = [...query.data.rotations.map(row => sameCoverage ? saved.find(item => item.id === row.id) || row : row),
    ...saved.filter(row => !query.data.rotations.some(item => item.id === row.id))];
  const range = `${from}|${to}`;
  const ids = selection?.range === range ? selection.ids : suggestedRotations(query.data.rotations, from, to);
  return <fieldset disabled={disabled} className="space-y-2 rounded-lg border border-border p-3">
    <legend className="px-1 text-xs font-semibold">Company departments / rotations (optional)</legend>
    <p className="text-xs leading-relaxed text-muted-foreground">Select the departments covered by your dates. Rotations after the estimated internship end date are included.</p>
    <input type="hidden" name="rotation_ids" value={JSON.stringify(ids)} />
    {!available.length && <p className="text-xs text-muted-foreground">Add assignments in My Records → Company rotations first.</p>}
    {available.map(row => {
      const overlaps = Boolean(from && to && row.date_from <= to && row.date_to >= from);
      return <label key={row.id} className={`flex items-start gap-2 text-sm ${!overlaps ? "text-muted-foreground" : ""}`}>
        <input type="checkbox" checked={ids.includes(row.id)} disabled={disabled || !overlaps} className="mt-1 accent-primary"
          onChange={event => setSelection({ range, ids: event.target.checked ? [...ids, row.id] : ids.filter(id => id !== row.id) })} />
        <span className="min-w-0 break-words">{row.department_name}<span className="block text-xs text-muted-foreground">{rotationDate(row.date_from)} – {rotationDate(row.date_to)}{!query.data.rotations.some(item => item.id === row.id) ? " · Saved assignment" : ""}</span></span>
      </label>;
    })}
  </fieldset>;
}
