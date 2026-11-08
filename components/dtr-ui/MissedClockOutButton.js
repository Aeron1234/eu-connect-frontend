"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { useUser } from "@/contexts/UserContext";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { dtrKeys } from "@/lib/cache/dtr-queries";
import { reportMissedClockOut } from "@/lib/server-actions/dtr-actions";

function manilaInputTime(value) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = type => parts.find(item => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export default function MissedClockOutButton({ record, internshipId }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [claimedEnd, setClaimedEnd] = useState("");
  const [explanation, setExplanation] = useState("");
  if (!record?.clock_in || record.clock_out || record.auto_closed) return null;

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await reportMissedClockOut(explanation.trim(), claimedEnd);
      if (!result?.success) { toast.error(result?.error || "Could not report the missed clock-out."); return; }
      toast.success(result.message);
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(user?.id, "student") }),
        queryClient.invalidateQueries({ queryKey: dtrKeys.student(user?.id, internshipId) }),
      ]);
    } finally { setBusy(false); }
  }

  return <Modal open={open} onOpenChange={setOpen} variant="form"
    trigger={<span>Report missed clock out</span>}
    triggerStyles="inline-flex min-h-8 items-center rounded-md px-1 text-xs font-medium text-white/80 underline-offset-2 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    title="Report a missed clock-out"
    description="Use this only if you already stopped working and forgot to clock out. Your reported time and hours need staff review; there will be no clock-out photo or location check.">
    <div className="space-y-3 p-4 text-sm sm:p-6">
      <label className="block font-medium text-foreground">When did you stop working? (Philippine time)
        <input type="datetime-local" value={claimedEnd} onChange={event => setClaimedEnd(event.target.value)}
          min={manilaInputTime(record.clock_in)} max={manilaInputTime(new Date())}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" />
      </label>
      <label className="block font-medium text-foreground">Why did you miss clock-out?
        <textarea value={explanation} onChange={event => setExplanation(event.target.value)} maxLength={1000} rows={4}
          placeholder="Explain what happened and when you stopped working."
          className="mt-1 w-full rounded-md border border-border bg-background p-2 text-foreground" />
      </label>
      <p className="text-xs text-foreground-soft">You can start another shift only after the existing daily and six-hour rest rules allow it.</p>
      <button type="button" onClick={submit} disabled={busy || !claimedEnd || explanation.trim().length < 15}
        className="rounded-md bg-primary px-3 py-2 font-medium text-white disabled:opacity-50">
        {busy ? "Submitting…" : "Submit for review"}
      </button>
    </div>
  </Modal>;
}
