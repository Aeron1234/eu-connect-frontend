import { rotationSnapshots } from "@/lib/internship-rotations.mjs";

export default function NarrativeRotations({ narrative }) {
  const rows = rotationSnapshots(narrative.rotation_assignments);
  if (!rows.length) return null;
  return <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Company departments for this narrative">
    {rows.map((row, index) => <span key={row.id || index} className="max-w-full break-words rounded-md bg-primary/10 px-2 py-1 text-xs text-primary-emphasis">{row.department_name}{row.supervisor_name ? ` · ${row.supervisor_name}` : ""}</span>)}
  </div>;
}
