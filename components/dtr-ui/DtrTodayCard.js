import { FileText, MapPin } from "lucide-react";
import DtrButton from "./DtrButton";
import BreakButton from "./BreakButton";
import { formatDtrDate, formatDtrTime } from "@/lib/dtr-time.mjs";
import Link from "next/link";
import Modal from "../ui/Modal";
import HelpManual from "@/components/help-ui/HelpManual";
import InternshipRecordFinishForm from "./InternshipRecordFinishForm";
import DtrOvertimeControls from "./DtrOvertimeControls";
import MissedClockOutButton from "./MissedClockOutButton";
import DtrReviewDetails from "./DtrReviewDetails";

function manilaDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function scheduleTime(value) {
  if (!/^\d{2}:\d{2}$/.test(value || "")) return null;
  const [hours, minutes] = value.split(":").map(Number);
  if (hours > 23 || minutes > 59) return null;
  return new Intl.DateTimeFormat("en-PH", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" })
    .format(new Date(Date.UTC(2020, 0, 1, hours, minutes)));
}

function scheduleDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

function shiftPosition(clockIn, start, end) {
  if (!clockIn || !start || !end) return null;
  const date = new Date(clockIn);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const clock = Number(parts.find((part) => part.type === "hour")?.value) * 60 + Number(parts.find((part) => part.type === "minute")?.value);
  const minutes = (value) => { const [hour, minute] = value.split(":").map(Number); return hour * 60 + minute; };
  const first = minutes(start);
  const last = minutes(end);
  const duration = (last - first + 1440) % 1440;
  if (!Number.isFinite(clock) || !duration) return null;
  const elapsed = (clock - first + 1440) % 1440;
  if (elapsed > duration) return 0;
  return Math.min(100, Math.max(0, elapsed / duration * 100));
}

function DtrTodayCard({ internshipData, status, dtrRecord, dtrToday = {}, pendingAutoCloseRecord }) {
  const hasOngoingInternship = internshipData?.status === "ongoing";
  const requiredHours = Number(internshipData?.total_hours);
  const creditedHours = Number(internshipData?.accumulated_hours);
  const safeCreditedHours = Number.isFinite(creditedHours) ? Math.max(0, creditedHours) : 0;
  const remainingHours = Number.isFinite(requiredHours) && requiredHours > 0
    ? Math.max(0, requiredHours - safeCreditedHours)
    : null;
  const hoursFormatter = new Intl.NumberFormat("en-PH", { maximumFractionDigits: 2 });
  const scheduleIn = scheduleTime(internshipData?.schedule_in);
  const scheduleOut = scheduleTime(internshipData?.schedule_out);
  const hasSchedule = Boolean(scheduleIn && scheduleOut);
  const clockInPosition = hasSchedule ? shiftPosition(dtrToday?.clock_in, internshipData.schedule_in, internshipData.schedule_out) : null;
  const startDate = internshipData?.date_started;
  const startDay = typeof startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(startDate)
    ? startDate
    : startDate ? manilaDay(startDate) : null;
  const todayDay = manilaDay(new Date());
  const shiftStartDay = dtrToday?.clock_in ? manilaDay(dtrToday.clock_in) : null;
  // Gate clock controls using the Philippine start day; backend checks remain authoritative.
  const dtrAvailable = Boolean(startDay && todayDay >= startDay);
  const hasOpenShift = Boolean(
    (status === "CLOCKED_IN" || status === "ON_BREAK") &&
    dtrRecord?.clock_in && !dtrRecord.clock_out && !dtrRecord.auto_closed
  );
  const systemClosed = status === "CLOCKED_OUT" && Boolean(dtrRecord?.auto_closed);

  // Offer internship completion only outside an open shift/break and after
  // credited accumulated hours reach the required total.
  const canFinish =
    status !== "CLOCKED_IN" && status !== "ON_BREAK" &&
    !["pending_explanation", "pending_review"].includes(dtrRecord?.auto_close_review_status) &&
    internshipData?.accumulated_hours >= internshipData?.total_hours;

  const today = formatDtrDate(new Date());

  return (
    <section className="relative overflow-hidden rounded-xl bg-primary p-4 text-white shadow-sm sm:p-5">
      {hasOngoingInternship && (
        <HelpManual guideId="dtr" title="How to use your daily time record" triggerStyles="absolute right-5 top-5 z-10 inline-flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6" />
      )}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/20 pb-3 pr-9 sm:pb-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold leading-tight sm:text-xl">DTR Today</h2>
          <p className="mt-0.5 text-xs text-white/80 sm:text-sm">{today}</p>
        </div>
        {hasOngoingInternship && <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium">{hasOpenShift ? status === "ON_BREAK" ? "On break" : "On shift" : systemClosed ? dtrRecord.missed_clock_out ? "Missed clock-out" : "System closed" : "Off shift"}</span>}
      </div>
      <div className="min-w-0">
          {hasOngoingInternship && hasSchedule && (
            <div className="border-b border-white/20 py-3 sm:py-4" aria-label={`Employer schedule: ${scheduleIn} to ${scheduleOut}`}>
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-end gap-2 sm:gap-4">
                <div><p className="text-[10px] text-white/70">Scheduled in</p><p className="whitespace-nowrap text-sm font-semibold tabular-nums sm:text-base">{scheduleIn}</p></div>
                <div className="relative mb-1.5 h-1.5 rounded-full bg-white/30" aria-hidden="true">
                  {clockInPosition !== null && <><span className="absolute inset-y-0 left-0 rounded-full bg-white/80" style={{ width: `${clockInPosition}%` }} /><span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{ left: `${clockInPosition}%` }} /></>}
                </div>
                <div className="text-right"><p className="text-[10px] text-white/70">Scheduled out</p><p className="whitespace-nowrap text-sm font-semibold tabular-nums sm:text-base">{scheduleOut}</p></div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium">{dtrToday?.clock_in ? `Clocked in ${formatDtrTime(dtrToday.clock_in)}` : "Not clocked in yet"}</span>
                {Boolean(dtrToday?.is_late) && <span className="rounded-full bg-white/15 px-2 py-0.5 font-medium">Late</span>}
                {internshipData.schedule_in > internshipData.schedule_out && <span className="text-white/75">Overnight shift</span>}
              </div>
              {(internshipData.schedule_start_date || internshipData.schedule_end_date) && (
                <p className="mt-1 text-[11px] text-white/75">Effective {scheduleDate(internshipData.schedule_start_date) || "any date"} – {scheduleDate(internshipData.schedule_end_date) || "ongoing"}</p>
              )}
            </div>
          )}
          {hasOngoingInternship && !hasSchedule && (
            <div className="border-b border-white/20 py-3 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="text-xs font-medium">Today&apos;s attendance</p>
                  <p className="mt-0.5 text-[11px] text-white/70">No employer shift hours set</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white/70">Clock in</p>
                    <p className="mt-0.5 whitespace-nowrap text-sm font-semibold tabular-nums">{formatDtrTime(dtrToday?.clock_in)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-white/70">Clock out</p>
                    <p className="mt-0.5 text-sm font-semibold tabular-nums">{dtrToday?.missed_clock_out ? "Reported end" : dtrToday?.auto_closed ? "System closed" : formatDtrTime(dtrToday?.clock_out)}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[10px] uppercase tracking-wide text-white/70">Status</p>
                    <span className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium">
                      {dtrToday?.clock_out
                        ? dtrToday?.auto_closed
                          ? dtrToday.missed_clock_out ? "Missed clock-out"
                            : dtrToday.auto_close_review_status === "pending_explanation" ? "Needs explanation"
                            : dtrToday.auto_close_review_status === "pending_review" ? "Needs review"
                              : "System closed"
                          : "Clocked out"
                        : dtrToday?.status === "on-break" || status === "ON_BREAK"
                          ? "On break"
                          : dtrToday?.status || "No shift"}
                    </span>
                  </div>
                </div>
              </div>
              {shiftStartDay && shiftStartDay < todayDay && (
                <p className="mt-2 text-xs text-white/80">Overnight shift started {formatDtrDate(dtrToday.clock_in)}.</p>
              )}
            </div>
          )}
          <div className="grid gap-3 border-b border-white/20 py-3 sm:py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            {hasOngoingInternship && remainingHours !== null && (
              <div className="min-w-0" aria-label={`${hoursFormatter.format(remainingHours)} internship hours remaining`}>
                <p className="flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold leading-none tabular-nums sm:text-3xl">
                  {hoursFormatter.format(remainingHours)} <span className="text-sm font-normal text-white/85 sm:text-base">{remainingHours > 0 ? "hours remaining" : "hours left"}</span>
                </p>
                <p className="mt-1 text-xs text-white/75">{hoursFormatter.format(safeCreditedHours)} / {hoursFormatter.format(requiredHours)} hours credited</p>
              </div>
            )}
          {!hasOngoingInternship ? (
            <p className="text-sm text-white/80">
              You don&apos;t have an ongoing internship record. Start or
              activate a record to track your daily attendance.
            </p>
          ) : null}
          {hasOngoingInternship && !dtrAvailable && (
            <p className="mt-3 text-xs text-primary-foreground/85" role="status">
              {startDay
                ? `DTR clock-in and clock-out become available on your internship start date (${new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${startDay}T00:00:00Z`))}).`
                : "DTR is unavailable until your internship start date is set."}
            </p>
          )}
        {hasOngoingInternship ? (
          canFinish ? (
            <Modal variant="confirmation"
              triggerStyles="w-full sm:w-auto"
              trigger={
                <div
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-primary-500 transition-colors hover:brightness-95 sm:w-auto xl:px-5"
                  title={"Finish this internship record."}
                >
                  Finish Internship Record
                </div>
              }
              title={
                <span className={`text-primary-emphasis`}>
                  Finish this internship record?
                </span>
              }
            >
              <InternshipRecordFinishForm
                internshipId={internshipData?.id || ""}
              />
            </Modal>
          ) : (
            <div className="w-full lg:w-auto lg:border-l lg:border-white/20 lg:pl-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <DtrButton internshipData={internshipData} status={status} record={dtrRecord} disabled={!dtrAvailable} pendingExplanation={Boolean(pendingAutoCloseRecord)} />
                <BreakButton status={status} record={dtrRecord} internshipId={internshipData?.id} />
              </div>
              {hasOpenShift && (
                <div className="mt-1.5">
                  <MissedClockOutButton record={dtrRecord} internshipId={internshipData?.id} />
                </div>
              )}
            </div>
          )
        ) : (
          <Link
            className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-primary-500 transition-colors hover:brightness-95 sm:w-auto xl:px-5"
            href="/student/internship-record"
            title="Create internship record"
          >
            <FileText className="w-4 h-4" />
            Internship Records
          </Link>
        )}
        </div>
          {systemClosed && <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/20 py-2 text-xs text-white/90" role="status">
            <span>{dtrRecord.missed_clock_out ? "Missed clock-out reported. Hours await review." : "System closed this shift without a clock-out photo."}</span>
            {dtrRecord.auto_close_review_status === "pending_explanation" && <span>Explain this shift before your next clock-in.</span>}
            <DtrReviewDetails dtr={dtrRecord} prompt={dtrRecord.auto_close_review_status === "pending_explanation"} onMaroon />
          </div>}
          {hasOngoingInternship && <DtrOvertimeControls record={dtrRecord} internshipId={internshipData?.id} status={status} />}
          <p className="flex min-w-0 items-start gap-1.5 pt-3 text-xs text-white/75">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{" "}
            <span
              className="min-w-0 break-words line-clamp-3 sm:line-clamp-none"
              title={internshipData?.company_address || ""}
            >
              <strong className="text-[#fff4ee]">{internshipData?.company_name || "Company"}</strong>{" - "}
              {internshipData?.company_address ||
                "No saved company address available"}
            </span>
          </p>

      </div>
    </section>
  );
}

export default DtrTodayCard;
