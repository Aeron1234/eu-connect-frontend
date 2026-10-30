export const MAX_DTR_SELECTION = 100;

// Selection belongs to internship IDs, not pages or filters. Never select hidden
// result pages with the table header checkbox; the server rechecks every ID.
export function selectDtrPage(current, rows, checked) {
  const next = new Map(current);
  if (checked && new Set([...next.keys(), ...rows.map(row => row.internship_id)]).size > MAX_DTR_SELECTION) return null;
  for (const row of rows) {
    if (checked) next.set(row.internship_id, row);
    else next.delete(row.internship_id);
  }
  return next;
}
export function remainingDtrSelection(current, results) {
  const next = new Map(current);
  for (const result of results) if (result.status === 'assigned' || result.status === 'unchanged') next.delete(result.internship_id);
  return next;
}
export function validDtrDraft(draft, radius) {
  const validNumber = value => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '' && Number.isFinite(Number(value));
  return validNumber(draft.lat) && validNumber(draft.lon) && Math.abs(Number(draft.lat)) <= 90 && Math.abs(Number(draft.lon)) <= 180 &&
    Number.isInteger(Number(radius)) && Number(radius) >= 20 && Number(radius) <= 2000 &&
    (draft.address || '').length <= 255 && (draft.label || '').length <= 255;
}
