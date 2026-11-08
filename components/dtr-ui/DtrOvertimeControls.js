"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import Modal from "@/components/ui/Modal";
import DtrReviewDetails from "./DtrReviewDetails";
import { requestDtrOvertime } from "@/lib/server-actions/dtr-actions";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { dtrKeys } from "@/lib/cache/dtr-queries";
import { toast } from "sonner";

function manilaDateTime(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const part = (key) => parts.find((item) => item.type === key)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export default function DtrOvertimeControls({ record, internshipId, status }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => Date.now());
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [intendedEnd, setIntendedEnd] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!record) return null;
  const active = (status === "CLOCKED_IN" || status === "ON_BREAK") &&
    Boolean(record.clock_in) && !record.clock_out && !record.auto_closed;
  const started = new Date(record.clock_in).getTime();
  const elapsedHours = active && Number.isFinite(started) ? Math.max(0, (now - started) / 3_600_000) : 0;
  const expectedEnd = record.expected_clock_out ? new Date(record.expected_clock_out).getTime() : NaN;
  const nearEnd = Number.isFinite(expectedEnd)
    ? now >= expectedEnd - 30 * 60_000
    : elapsedHours >= 8;
  const canRequest = active && nearEnd && !record.overtime_status && elapsedHours < 16;
  const hasReview = Boolean(record.overtime_status && !record.auto_closed);

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await requestDtrOvertime(reason.trim(), intendedEnd);
      if (!result?.success) { toast.error(result?.error || "Could not request overtime."); return; }
      toast.success(result.message || "Overtime requested.");
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(user?.id, "student") }),
        queryClient.invalidateQueries({ queryKey: dtrKeys.student(user?.id, internshipId) }),
      ]);
    } finally { setBusy(false); }
  }

  return <div className="space-y-2">
    {active && elapsedHours >= 12 && <p role="alert" className="rounded-md border border-white/50 bg-white/15 px-3 py-2 text-xs">
      This shift has been open for {Math.floor(elapsedHours)} hours. Please clock out with your photo and location before the 16-hour safety close. Your daily credit cap still applies.
    </p>}
    {canRequest && <Modal open={open} onOpenChange={setOpen} variant="form"
      trigger={<span>Continue for overtime</span>}
      triggerStyles="rounded-md border border-white/60 px-3 py-2 text-xs font-medium text-white hover:bg-white/15"
      title="Request extra shift time"
      description="Tell your supervisor why you need more time. You can still clock out with a photo while approval is pending.">
      <div className="min-h-0 space-y-3 overflow-y-auto p-4 text-sm sm:p-6">
        <label className="block text-foreground">Reason
          <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background p-2" placeholder="Why do you need to continue?" />
        </label>
        <label className="block text-foreground">Intended end (Philippine time)
          <input type="datetime-local" value={intendedEnd} onChange={(event) => setIntendedEnd(event.target.value)}
            min={manilaDateTime(new Date(now))} max={manilaDateTime(new Date(started + 16 * 3_600_000))}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2" />
        </label>
        <button type="button" disabled={busy || reason.trim().length < 10 || !intendedEnd}
          onClick={submit} className="rounded-md bg-primary px-3 py-2 text-white disabled:opacity-50">
          {busy ? "Sending…" : "Send request"}
        </button>
      </div>
    </Modal>}
    {hasReview && <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
      {record.missed_clock_out ? <span>Missed clock-out reported. Hours await review.</span> : record.auto_closed && <span>{record.auto_close_review_status === "legacy_credited"
        ? "System closed—no clock-out photo. Previously credited hours remain unchanged."
        : "System closed—no clock-out photo. Hours await review."}</span>}
      {record.overtime_status && <span>Overtime: {record.overtime_status === "not_approved" ? "Not approved" : record.overtime_status === "approved" ? "Approved" : "Requested"}</span>}
      {!record.auto_closed && <DtrReviewDetails dtr={record} onMaroon />}
    </div>}
  </div>;
}
