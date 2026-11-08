"use client";

import { LogIn, LogOut } from "lucide-react";
import Modal from "../ui/Modal";
import DtrForm from "./DtrForm";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dtrKeys } from "@/lib/cache/dtr-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";

const manilaClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function scheduledOpening(now, internshipData) {
  const startTime = internshipData?.schedule_in;
  const endTime = internshipData?.schedule_out;
  if (!/^\d{2}:\d{2}$/.test(startTime || "") || !/^\d{2}:\d{2}$/.test(endTime || "")) return null;
  const parts = Object.fromEntries(manilaClock.formatToParts(now).map(({ type, value }) => [type, value]));
  const actual = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  const day = Date.UTC(+parts.year, +parts.month - 1, +parts.day);
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  let shiftStart = day + startMinutes * 60_000;
  if (endHour * 60 + endMinute <= startMinutes && actual < shiftStart - 12 * 60 * 60_000) shiftStart -= 86_400_000;
  if (startMinutes < 30 && actual >= day + 86_400_000 - 30 * 60_000) shiftStart += 86_400_000;
  const shiftDate = new Date(shiftStart).toISOString().slice(0, 10);
  if ((internshipData.schedule_start_date && shiftDate < internshipData.schedule_start_date) ||
      (internshipData.schedule_end_date && shiftDate > internshipData.schedule_end_date)) return null;
  return { open: actual >= shiftStart - 30 * 60_000, opensAt: shiftStart - 30 * 60_000 };
}

function DtrButton({ internshipData, status, record, disabled = false, pendingExplanation = false }) {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const queryClient = useQueryClient();
  const { user } = useUser();
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(timer);
  }, []);
  // Refresh attendance only after a successful write. The DTR form closes the
  // confirmation after either result, leaving its success/error toast visible.
  function handleSuccess() {
    void queryClient.invalidateQueries({
      queryKey: dtrKeys.student(user?.id, internshipData?.id),
    });
    void queryClient.invalidateQueries({
      queryKey: dashboardOverviewKeys.role(user?.id, "student"),
    });
  }
  const hasOpenShift = Boolean(record?.clock_in && !record.clock_out && !record.auto_closed);
  if (
    !internshipData ||
    status === "ON_BREAK" ||
    (status !== "CLOCKED_OUT" && !hasOpenShift) ||
    (status === "CLOCKED_OUT" && hasOpenShift) ||
    (status === "CLOCKED_OUT" && pendingExplanation) ||
    internshipData?.accumulated_hours >= internshipData?.total_hours
  )
    return null;

  const isOut = status === "CLOCKED_OUT";
  const clockInOpening = isOut ? scheduledOpening(now, internshipData) : null;
  const tooEarly = clockInOpening && !clockInOpening.open;
  const theme = {
    label: isOut ? "Clock in" : "Clock out",
    icon: isOut ? (
      <LogIn className="h-5 w-5" />
    ) : (
      <LogOut className="h-5 w-5" />
    ),
  };

  if (disabled || tooEarly) {
    const opensAt = tooEarly
      ? new Intl.DateTimeFormat("en-PH", { timeZone: "UTC", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(clockInOpening.opensAt))
      : null;
    const explanation = tooEarly
      ? `Clock in opens at ${opensAt} (Philippine time), 30 minutes before your scheduled start.`
      : "DTR is unavailable before the internship start date";
    return (
      <div className="w-full sm:w-auto">
        <button type="button" disabled className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-md bg-white/60 px-4 py-2.5 text-sm font-semibold text-primary/70 sm:w-auto" title={explanation}>
          {theme.icon} {theme.label}
        </button>
        {tooEarly && !disabled && <p className="mt-1.5 text-xs text-white/80" role="status">{explanation}</p>}
      </div>
    );
  }

  return (
    <Modal variant="confirmation"
      intent={isOut ? "clock-in" : "clock-out"}
      open={open}
      onOpenChange={setOpen}
      triggerStyles="w-full sm:w-auto"
      trigger={
        <div
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-xs font-medium text-primary transition hover:bg-white/90 sm:w-auto"
          title={theme.label}
        >
          {theme.icon} {theme.label}
        </div>
      }
      title={<span className={`text-primary-emphasis`}>{theme.label}?</span>}
    >
      <DtrForm isOut={isOut} onSuccess={handleSuccess} onSettled={() => setOpen(false)} />
    </Modal>
  );
}

export default DtrButton;
