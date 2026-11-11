"use client";

import { format } from "date-fns";
import { LogIn, LogOut, Trash2 } from "lucide-react";
import DtrDeleteForm from "./DtrDeleteForm";
import Modal from "../ui/Modal";
import DtrPhotoButton from "./DtrPhotoButton";
import Link from "next/link";
import DtrReviewDetails from "./DtrReviewDetails";

import {AbsenceDetails} from './AbsenceDetails';

const statusStyles = {
  present: "text-emerald-700 bg-emerald-50",
  "on-break": "text-amber-700 bg-amber-50",
  "Half Day": "text-amber-700 bg-amber-50",
  absent: "text-primary-emphasis bg-accent",
};

function displayDate(value, pattern) {
  if (!value || value === "—") return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, pattern);
}

function DtrTable({ dtrs = [], allowDelete = false, onDeleted, showStudent = false }) {
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className={`w-full ${showStudent ? "min-w-[1600px]" : "min-w-[1380px]"} text-sm`}>
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
            {showStudent && <th className="min-w-56 px-3 py-2 text-left font-medium">Student / internship</th>}
            <th className="min-w-32 px-3 py-2 text-left font-medium">Date</th>
            <th className="min-w-32 px-3 py-2 text-left font-medium">Clock In</th>
            <th className="min-w-40 px-3 py-2 text-left font-medium">Clock Out</th>
            <th className="min-w-72 px-3 py-2 text-left font-medium">Pictures</th>
            <th className="min-w-20 px-3 py-2 text-left font-medium">Hours</th>
            <th className="min-w-32 px-3 py-2 text-left font-medium">Timing</th>
            <th className="min-w-36 px-3 py-2 text-left font-medium">Status</th>
            <th className="min-w-64 px-3 py-2 text-left font-medium">Review</th>
            {allowDelete && <th className="w-12 px-3 py-2 text-left"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {dtrs.map((dtr) => (
            <tr key={dtr.id} className="border-b border-border last:border-b-0">
              {showStudent && <td className="px-3 py-3 text-left">
                <Link href={`/department_head/attendance/${encodeURIComponent(dtr.internship_id)}`} className="font-medium text-primary-emphasis hover:underline">{dtr.student_name || "Student"}</Link>
                <div className="max-w-56 truncate text-xs text-muted-foreground" title={dtr.company_name}>{dtr.company_name || "—"}</div>
              </td>}
              <td className="whitespace-nowrap px-3 py-3 text-left text-foreground">
                {displayDate(dtr.clock_in || dtr.created_at, "MMM d, yyyy")}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-left">
                {dtr.clock_in && dtr.clock_in !== "—" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <LogIn className="size-3" />
                    {displayDate(dtr.clock_in, "h:mm a")}
                  </span>
                ) : <span className="text-foreground-soft">—</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-left">
                {dtr.missed_clock_out ? (
                  <span className="inline-flex flex-col text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-medium">Reported end</span>
                    <span>{displayDate(dtr.claimed_clock_out_at, "MMM d, h:mm a")}</span>
                  </span>
                ) : dtr.auto_closed ? (
                  <span className="inline-flex flex-col text-xs text-amber-800">
                    <span className="font-medium">System closed</span>
                    <span>{displayDate(dtr.auto_closed_at || dtr.clock_out, "MMM d, h:mm a")}</span>
                  </span>
                ) : dtr.clock_out ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-primary-emphasis">
                    <LogOut className="size-3" />
                    {displayDate(dtr.clock_out, "h:mm a")}
                  </span>
                ) : <span className="text-foreground-soft">—</span>}
              </td>
              <td className="px-3 py-3 text-left">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  {Boolean(dtr.clock_in_photo_path) && <DtrPhotoButton dtrId={dtr.id} kind="in" />}
                  {Boolean(dtr.clock_out_photo_path) && !dtr.auto_closed && <DtrPhotoButton dtrId={dtr.id} kind="out" />}
                  {Boolean(dtr.flagged) && dtr.flag_reason?.startsWith("Department-head attendance correction") && <span className="text-xs text-muted-foreground">Staff correction - no camera/GPS evidence</span>}
                  {Boolean(dtr.auto_closed) && <span className="text-xs text-amber-800 dark:text-amber-300">No clock-out photo</span>}
                  {!dtr.clock_in_photo_path && !dtr.clock_out_photo_path && !dtr.auto_closed && <span className="text-foreground-soft">—</span>}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-left font-medium text-foreground">
                {dtr.total_hours == null ? "-" : Number(dtr.total_hours).toFixed(2)}
              </td>
              <td className="px-3 py-3 text-left">
                <div className="flex items-center justify-start gap-1 whitespace-nowrap text-xs">
                  {Boolean(dtr.is_late) && <span className="rounded-md bg-amber-100 px-2 py-0.5 font-medium text-amber-900">Late</span>}
                  {Boolean(dtr.is_undertime) && <span className="rounded-md bg-rose-100 px-2 py-0.5 font-medium text-rose-900">Undertime</span>}
                  {Boolean(dtr.is_overtime) && <span className="rounded-md bg-sky-100 px-2 py-0.5 font-medium text-sky-900">Overtime</span>}
                  {!dtr.is_late && !dtr.is_undertime && !dtr.is_overtime && <span className="text-foreground-soft">—</span>}
                </div>
              </td>
              <td className="px-3 py-3 text-left">
                <div className="flex items-center justify-start whitespace-nowrap text-xs">
                  <span className={`inline-block rounded-md px-2 py-0.5 font-medium ${dtr.auto_closed ? "bg-amber-100 text-amber-900" : statusStyles[dtr.status] || "bg-muted text-foreground-soft"}`}>
                    {dtr.missed_clock_out ? "Missed clock-out" : dtr.auto_closed ? "Auto-closed" : dtr.status === "on-break" ? "On break" : dtr.status}
                  </span>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-left">
                {dtr.absence_report ? <div className="space-y-1"><span className="block text-xs text-muted-foreground">{dtr.absence_report.review_status.replaceAll("_"," ")}</span><AbsenceDetails report={dtr.absence_report} staff={dtr.absence_staff} /></div> : dtr.auto_closed || dtr.overtime_status ? <DtrReviewDetails dtr={dtr} /> : <span className="text-foreground-soft">—</span>}
              </td>
              {allowDelete && (
                <td className="px-3 py-3 text-left">
                  {!dtr.auto_closed && <Modal variant="confirmation"
                    trigger={
                      <div className="flex items-center justify-center">
                        <Trash2 className="size-4" />
                        <span className="sr-only">Delete record</span>
                      </div>
                    }
                    triggerStyles="text-foreground-subtle transition-colors hover:text-primary-emphasis"
                    title={<span className="text-primary-emphasis">Delete Daily Time Record</span>}
                  >
                    <DtrDeleteForm dtrId={dtr.id} onDeleted={onDeleted} />
                  </Modal>}
                </td>
              )}
            </tr>
          ))}
          {dtrs.length === 0 && (
            <tr>
              <td colSpan={(allowDelete ? 9 : 8) + Number(showStudent)} className="py-6 text-center text-sm text-foreground-soft">
                No time records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DtrTable;
