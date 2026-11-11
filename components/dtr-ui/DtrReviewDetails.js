"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import ModalForm from "@/components/ui/ModalForm";
import { useUser } from "@/contexts/UserContext";
import { decideDtrOvertime, explainAutoClosedDtr, reviewAutoClosedDtr } from "@/lib/server-actions/dtr-actions";

function manilaInputTime(value) {
  if (!value) return undefined;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = type => parts.find(item => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export default function DtrReviewDetails({ dtr, prompt = false, onMaroon = false }) {
  const { user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [claimedEnd, setClaimedEnd] = useState("");
  const [hours, setHours] = useState(String(dtr.proposed_hours ?? 0));
  const promptedId = useRef(null);
  const isStudent = user?.role === "student";
  const isReviewer = user?.role === "employer" ||
    (user?.role === "department_head" && user?.department_code !== "REG");
  const needsExplanation = Boolean(dtr.auto_closed) && dtr.auto_close_review_status === "pending_explanation";
  const canAddExplanation = isStudent && Boolean(dtr.auto_closed) && !dtr.student_explanation &&
    (needsExplanation || dtr.auto_close_review_status === "legacy_credited");
  const needsReview = Boolean(dtr.auto_closed) && dtr.auto_close_review_status === "pending_review";
  const canDecideOvertime = user?.role === "employer" && dtr.overtime_status === "requested";
  const reviewLabel = ({ pending_explanation: "Awaiting explanation", pending_review: "Awaiting review",
    approved: "Reviewed", adjusted: "Hours adjusted", legacy_credited: "Previously credited" })[dtr.auto_close_review_status];
  const overtimeLabel = ({ requested: "Requested", approved: "Approved", not_approved: "Not approved" })[dtr.overtime_status];

  useEffect(() => {
    if (prompt && isStudent && needsExplanation && promptedId.current !== dtr.id) {
      promptedId.current = dtr.id;
      setOpen(true);
    }
  }, [dtr.id, isStudent, needsExplanation, prompt]);

  if (!dtr.auto_closed && !dtr.overtime_status) return null;

  async function save(action) {
    if (busy) return;
    setBusy(true);
    try {
      const result = await action();
      if (!result?.success) { toast.error(result?.error || "Could not save the DTR update."); return; }
      toast.success(result.message || "DTR updated.");
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard-overview", String(user?.id)] }),
        queryClient.invalidateQueries({ queryKey: ["dtr", "student", String(user?.id)] }),
        queryClient.invalidateQueries({ queryKey: ["user-profile", String(user?.id)] }),
        queryClient.invalidateQueries({ queryKey: ["internship-records", String(user?.id)] }),
      ]);
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <Modal variant="form"
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setHours(String(dtr.proposed_hours ?? 0));
        setOpen(nextOpen);
      }}
      trigger={<span className={`text-xs font-medium hover:underline ${onMaroon ? "text-white" : "text-primary-emphasis"}`}>{dtr.auto_closed ? `${canAddExplanation ? "Add explanation" : "View explanation"} · ${reviewLabel || (dtr.missed_clock_out ? "Missed clock-out" : "Auto-closed")}` : `Overtime · ${overtimeLabel || "Requested"}`}</span>}
      triggerStyles="inline-flex min-h-8 items-center whitespace-nowrap text-left"
      title={dtr.missed_clock_out ? "Reported missed clock-out" : dtr.auto_closed ? "Automatically closed shift" : "Overtime request"}
      description={dtr.missed_clock_out ? "The student reported when they stopped working. This time has no clock-out photo or location check and needs review." : dtr.auto_closed ? "The system closed this entry without a student clock-out photo or location check." : "The student can still clock out normally while a request is pending."}
    >
      <ModalForm.Root onSubmit={event => { event.preventDefault(); if (canAddExplanation) void save(() => explainAutoClosedDtr(dtr.id, explanation.trim(), needsExplanation ? claimedEnd : null)); else if (isReviewer && needsReview) void save(() => reviewAutoClosedDtr(dtr.id, Number(hours))); }}>
      <ModalForm.Section title="Shift review">
        {dtr.auto_closed && <>
          <p><strong>Review:</strong> {({ pending_explanation: "Awaiting student explanation", pending_review: "Awaiting staff review", approved: "Approved", adjusted: "Hours adjusted", legacy_credited: "Credited before this review process" })[dtr.auto_close_review_status] || "Auto-closed"}</p>
          <p><strong>Proposed duty:</strong> {dtr.proposed_hours == null ? "—" : `${Number(dtr.proposed_hours).toFixed(2)} hours`} · <strong>Credited:</strong> {Number(dtr.total_hours || 0).toFixed(2)} hours</p>
          <p><strong>Student explanation:</strong> {dtr.student_explanation || "Not submitted yet."}</p>
          {dtr.claimed_clock_out_at && <p><strong>Student-reported end:</strong> {new Date(dtr.claimed_clock_out_at).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}</p>}
          {canAddExplanation && <div className="space-y-2 border-t border-border pt-3">
            {dtr.auto_close_review_status === "legacy_credited" &&
              <p className="text-xs text-foreground-soft">This older shift was already credited. Your explanation is optional and will not change its hours.</p>}
            {needsExplanation && <ModalForm.Field label="When did you stop working? (Philippine time)">
              <ModalForm.Input id={`dtr-claimed-end-${dtr.id}`} type="datetime-local" required disabled={busy} value={claimedEnd} onChange={event => setClaimedEnd(event.target.value)}
                min={manilaInputTime(dtr.clock_in)} max={manilaInputTime(dtr.auto_closed_at || dtr.clock_out)}
                 />
            </ModalForm.Field>}
            <ModalForm.Field label="Why did you miss clock out?">
            <ModalForm.Textarea id={`dtr-explanation-${dtr.id}`} value={explanation} onChange={event => setExplanation(event.target.value)} required minLength={15} maxLength={1000} rows={4} disabled={busy}
              placeholder="Explain what happened and when you stopped working." />
            </ModalForm.Field>
          </div>}
          {isReviewer && needsReview && <div className="space-y-2 border-t border-border pt-3">
            <label htmlFor={`dtr-hours-${dtr.id}`} className="block font-medium">Hours to credit (0 to {Number(dtr.proposed_hours || 0).toFixed(2)})</label>
            <ModalForm.Input id={`dtr-hours-${dtr.id}`} type="number" required disabled={busy} min="0" max={Number(dtr.proposed_hours || 0)} step="0.01" value={hours} onChange={event => setHours(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
            <p className="text-xs text-foreground-soft">The explanation does not verify the actual clock-out time. Review before crediting hours.</p>
          </div>}
        </>}
        {dtr.overtime_status && <div className="space-y-2 border-t border-border pt-3">
          <p><strong>Overtime:</strong> {dtr.overtime_status === "not_approved" ? "Not approved" : dtr.overtime_status === "approved" ? "Approved" : "Requested"}</p>
          <p><strong>Reason:</strong> {dtr.overtime_reason || "—"}</p>
          <p><strong>Intended end:</strong> {dtr.overtime_intended_end ? new Date(dtr.overtime_intended_end).toLocaleString("en-PH") : "—"}</p>
          {canDecideOvertime && <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy} onClick={() => save(() => decideDtrOvertime(dtr.id, "approved"))} className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50">Approve</button>
            <button type="button" disabled={busy} onClick={() => save(() => decideDtrOvertime(dtr.id, "not_approved"))} className="rounded-md border border-border px-3 py-2 disabled:opacity-50">Not approved</button>
          </div>}
        </div>}
      </ModalForm.Section>
      {canAddExplanation && <ModalForm.Actions isPending={busy} submitDisabled={explanation.trim().length < 15 || (needsExplanation && !claimedEnd)} submitLabel="Submit explanation" closeOnSubmit={false} disableCancelWhilePending />}
      {isReviewer && needsReview && <ModalForm.Actions isPending={busy} submitDisabled={hours === "" || Number(hours) < 0 || Number(hours) > Number(dtr.proposed_hours || 0)} submitLabel="Confirm credited hours" closeOnSubmit={false} disableCancelWhilePending />}
      </ModalForm.Root>
    </Modal>
  );
}
