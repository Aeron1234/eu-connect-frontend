import { FileText, MapPin } from "lucide-react";
import DtrButton from "./DtrButton";
import BreakButton from "./BreakButton";
import { formatDtrDate, formatDtrTime } from "@/lib/dtr-time.mjs";
import Link from "next/link";
import Modal from "../ui/Modal";
import ManualDialog from "../ui/ManualDialog";
import InternshipRecordFinishForm from "./InternshipRecordFinishForm";

function DtrTodayCard({ internshipData, status, dtrRecord, dtrToday = {} }) {
  const hasOngoingInternship = internshipData?.status === "ongoing";

  const canFinish =
    status !== "CLOCKED_IN" && status !== "ON_BREAK" &&
    internshipData?.accumulated_hours >= internshipData?.total_hours;

  const today = formatDtrDate(new Date());

  return (
    <section className="brand-orbit relative rounded-xl bg-primary text-white p-5 sm:p-6 shadow-sm">
      {hasOngoingInternship && (
        <ManualDialog title="How to use your daily time record" triggerStyles="absolute right-5 top-5 z-10 inline-flex size-8 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-6 sm:top-6">
          <div className="space-y-4 text-sm leading-relaxed text-foreground">
            <p>Use this card to record your attendance for your ongoing internship.</p>
            <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
              <li><strong>Start your shift:</strong> At your approved DTR location, select <strong>Clock in</strong>, then confirm with <strong>Save</strong>. Allow your browser to access your current location.</li>
              <li><strong>Take a break:</strong> While clocked in, select <strong>Start break</strong> and confirm. Select <strong>Resume duty</strong> when you return so your duty-hour timer continues.</li>
              <li><strong>End your shift:</strong> After resuming from any break, select <strong>Clock out</strong> and confirm with <strong>Save</strong>. Your current location is checked again, so be at your approved DTR location.</li>
              <li><strong>Check your record:</strong> This card shows today&apos;s clock-in, clock-out, and status. Your saved entries appear in <strong>Recent Time Records</strong> below.</li>
            </ol>
            <p className="text-foreground-soft">If your location cannot be found or a clock action fails, check your location permission and try again. If the approved pin is inaccurate, ask your department head, administrator, or supervisor to review your DTR location.</p>
          </div>
        </ManualDialog>
      )}
      <div className="flex flex-1 flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className={`min-w-0 flex-1 ${hasOngoingInternship ? "pr-9 sm:pr-10" : ""}`}>
          <p className="text-[11px] uppercase tracking-widest text-primary-foreground/70">
            Today
          </p>
          <h2 className="text-xl sm:text-2xl font-bold mt-0.5">{today}</h2>
          {hasOngoingInternship ? (
            <div className="grid grid-cols-3 gap-6 mt-4 max-w-md">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primary-200">
                  Clock In
                </p>
                <p className="text-lg font-semibold mt-0.5">
                  {formatDtrTime(dtrToday?.clock_in)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primary-200">
                  Clock Out
                </p>
                <p className="text-lg font-semibold mt-0.5">
                  {formatDtrTime(dtrToday?.clock_out)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-primary-200">
                  Status
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-foreground/15 text-[11px] font-medium">
                  {dtrToday?.status === "on-break" || status === "ON_BREAK"
                    ? "On break"
                    : dtrToday?.status || "No shift"}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-primary-foreground/80 max-w-md">
              You don&apos;t have an ongoing internship record. Start or
              activate a record to track your daily attendance.
            </p>
          )}
          <p className="flex items-center gap-1.5 mt-4 text-xs text-primary-foreground/75 ">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{" "}
            <span
              className="truncate w-full"
              title={internshipData?.company_address || ""}
            >
              Company Address:{" "}
              {internshipData?.company_address ||
                "No saved company address available"}
            </span>
          </p>
        </div>

        {hasOngoingInternship ? (
          canFinish ? (
            <Modal
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
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center xl:w-auto">
              <DtrButton internshipData={internshipData} status={status} />
              <BreakButton status={status} record={dtrRecord} />
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
    </section>
  );
}

export default DtrTodayCard;
