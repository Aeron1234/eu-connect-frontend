import { FileText, MapPin } from "lucide-react";
import DtrButton from "./DtrButton";
import BreakButton from "./BreakButton";
import { formatDtrDate, formatDtrTime } from "@/lib/dtr-time.mjs";
import Link from "next/link";
import Modal from "../ui/Modal";
import InternshipRecordFinishForm from "./InternshipRecordFinishForm";

function DtrTodayCard({ internshipData, status, dtrRecord, dtrToday = {} }) {
  const hasOngoingInternship = internshipData?.status === "ongoing";

  const canFinish =
    status !== "CLOCKED_IN" && status !== "ON_BREAK" &&
    internshipData?.accumulated_hours >= internshipData?.total_hours;

  const today = formatDtrDate(new Date());

  return (
    <section className="brand-orbit rounded-xl bg-primary text-white p-5 sm:p-6 shadow-sm">
      <div className="flex flex-1 flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="min-w-0 flex-1">
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
              description={`You have now completed the required hours.`}
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
