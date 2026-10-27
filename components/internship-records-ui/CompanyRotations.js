"use client";

import { useRef, useState } from "react";
import { Pencil, Plus, Repeat2, Trash2 } from "lucide-react";
import useInternshipRotations from "@/lib/hooks/useInternshipRotations";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { setInternshipRotationsEnabled, saveInternshipRotation, deleteInternshipRotation } from "@/lib/server-actions/rotations-actions";
import { toastAndAction } from "@/lib/helpers";
import { currentRotation, rotationDate } from "@/lib/internship-rotations.mjs";
import { studentRecordsKeys } from "@/lib/cache/student-records-queries";
import { weeklyNarrativesKeys } from "@/lib/cache/weekly-narratives-queries";
import { activeStorageRecordOptions } from "@/lib/cache/student-storage-queries";
import Modal from "../ui/Modal";
import ModalForm from "../ui/ModalForm";
import ErrorUI from "../ui/ErrorUI";
import { Button } from "../ui/button";

// Shared student editor/read-only timeline. Server capability flags control tools;
// backend ownership checks remain authoritative for every mutation.
export default function CompanyRotations({ internshipId, readOnly = false, compact = false, className = "" }) {
  const query = useInternshipRotations(internshipId);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  const busy = useRef(false);
  if (!internshipId) return null;
  if (query.isPending) return <div role="status" className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading company rotations…</div>;
  if (query.isError) return <ErrorUI compact error={query.error} reset={() => void query.refetch()} logError={false} />;
  const data = query.data;
  const canManage = !readOnly && data.canManage;
  if (!canManage && !data.enabled && !data.rotations.length) return null;
  const current = currentRotation(data.rotations);

  async function change(action, args) {
    if (busy.current) return;
    busy.current = true; setPending(true);
    try {
      const result = await toastAndAction({ action, args, loadingLabel: "Saving company rotations…", successLabel: "Company rotations updated.", errorLabel: "Could not save company rotations." });
      // A failed/unknown outcome still refreshes the timeline, while retaining the editor.
      await query.refetch();
      if (result?.success) {
        setEditor(null); setConfirmation(null);
        void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.all(user?.id) });
        void queryClient.invalidateQueries({ queryKey: weeklyNarrativesKeys.all(user?.id) });
        void queryClient.invalidateQueries({ queryKey: activeStorageRecordOptions(user?.id).queryKey });
      }
    } catch { await query.refetch(); }
    finally { busy.current = false; setPending(false); }
  }

  return <section className={`min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`} aria-label="Company rotations">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-base font-semibold"><Repeat2 className="size-4 shrink-0 text-primary-emphasis" />Company rotations{!data.enabled && <span className="text-xs font-normal text-muted-foreground">Optional</span>}</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Assignments within the same company. Your internship hours and overall supervisor stay the same.</p>
      </div>
      {canManage && <Button size="sm" variant="outline" disabled={pending} onClick={() => data.enabled ? setConfirmation({ kind: "disable" }) : void change(setInternshipRotationsEnabled, [internshipId, true])}>{data.enabled ? "Turn off" : "Enable rotations"}</Button>}
    </div>
    {(data.enabled || data.rotations.length > 0) && <>
      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-sm">
        <p className="text-xs font-medium text-muted-foreground">{data.enabled ? "Current assignment" : "Rotation history · tracking is off"}</p>
        <p className="mt-1 break-words font-semibold">{data.enabled && current ? current.department_name : data.enabled ? "No assignment for today" : "Saved assignments are retained"}</p>
        {data.enabled && current && <p className="mt-1 text-xs text-muted-foreground">{rotationDate(current.date_from)} – {rotationDate(current.date_to)}{current.supervisor_name && <> · {current.supervisor_name}</>}</p>}
      </div>
      {compact && <Button variant="link" className="mt-2 h-auto p-0 text-primary-emphasis" onClick={() => setExpanded(value => !value)}>{expanded ? "Hide rotations" : "View rotations"}</Button>}
      {expanded && <div className="mt-4 space-y-3">
        {canManage && data.enabled && data.status === "ongoing" && <Button size="sm" className="w-full sm:w-auto" disabled={pending} onClick={() => setEditor({})}><Plus className="size-4" />Add rotation</Button>}
        {canManage && data.enabled && data.status === "pending" && <p className="text-xs text-muted-foreground">You can add assignments once this internship is approved.</p>}
        {!data.rotations.length && <p className="text-sm text-muted-foreground">No rotations recorded yet.</p>}
        <ol className="space-y-3">{data.rotations.map(row => <li key={row.id} className="min-w-0 rounded-lg border border-border p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3"><h4 className="min-w-0 break-words text-sm font-semibold">{row.department_name}{data.enabled && current?.id === row.id && <span className="ml-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary-emphasis">Current</span>}</h4>
            {canManage && data.enabled && data.status === "ongoing" && <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" disabled={pending} aria-label={`Edit ${row.department_name}`} onClick={() => setEditor(row)}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" disabled={pending} aria-label={`Delete ${row.department_name}`} onClick={() => setConfirmation({ kind: "delete", row })}><Trash2 className="size-4" /></Button></div>}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rotationDate(row.date_from)} – {rotationDate(row.date_to)}</p>
          {row.supervisor_name && <p className="mt-2 break-words text-sm">Supervisor: {row.supervisor_name}</p>}
          {row.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{row.notes}</p>}
        </li>)}</ol>
      </div>}
    </>}
    <Modal variant="form" open={Boolean(editor)} onOpenChange={open => { if (!open && !pending) setEditor(null); }} title={editor?.id ? "Edit rotation" : "Add company rotation"}>
      {editor && <RotationForm key={editor.id || "new"} row={editor} data={data} pending={pending} onSave={fields => change(saveInternshipRotation, [internshipId, fields, editor.id])} />}
    </Modal>
    <Modal variant="confirmation" open={Boolean(confirmation)} onOpenChange={open => { if (!open && !pending) setConfirmation(null); }} title={confirmation?.kind === "delete" ? "Delete rotation?" : "Turn off company rotations?"}>
      <ModalForm.Root action={() => change(confirmation?.kind === "delete" ? deleteInternshipRotation : setInternshipRotationsEnabled, confirmation?.kind === "delete" ? [internshipId, confirmation.row.id] : [internshipId, false])}>
        <ModalForm.Confirmation>{confirmation?.kind === "delete" ? "Remove this assignment from your timeline? Saved narrative assignments will remain available." : "Your rotation history and saved narrative assignments will be preserved. You can enable tracking again later."}</ModalForm.Confirmation>
        <ModalForm.Actions isPending={pending} closeOnSubmit={false} disableCancelWhilePending submitLabel={confirmation?.kind === "delete" ? "Delete rotation" : "Turn off"} />
      </ModalForm.Root>
    </Modal>
  </section>;
}

function RotationForm({ row, data, pending, onSave }) {
  const [from, setFrom] = useState(row.date_from || "");
  return <ModalForm.Root action={form => onSave(Object.fromEntries(form))}>
    <ModalForm.Section title="Assignment details">
      <ModalForm.Field label="Company department or unit"><ModalForm.Input name="department_name" defaultValue={row.department_name || ""} maxLength={120} placeholder="e.g. Food and Beverage" required disabled={pending} /></ModalForm.Field>
      <ModalForm.Row>
        <ModalForm.Field label="Start date"><ModalForm.Input name="date_from" type="date" value={from} onChange={event => setFrom(event.target.value)} min={data.dateStarted} max={data.dateEnded} required disabled={pending} /></ModalForm.Field>
        <ModalForm.Field label="End date"><ModalForm.Input name="date_to" type="date" defaultValue={row.date_to || ""} min={from || data.dateStarted} max={data.dateEnded} required disabled={pending} /></ModalForm.Field>
      </ModalForm.Row>
      <ModalForm.Field label="Rotation supervisor (optional)"><ModalForm.Input name="supervisor_name" defaultValue={row.supervisor_name || ""} maxLength={120} disabled={pending} /></ModalForm.Field>
      <ModalForm.Field label="Notes (optional)"><ModalForm.Textarea name="notes" defaultValue={row.notes || ""} maxLength={1000} disabled={pending} /></ModalForm.Field>
    </ModalForm.Section>
    <ModalForm.Actions isPending={pending} closeOnSubmit={false} disableCancelWhilePending submitLabel="Save rotation" />
  </ModalForm.Root>;
}
