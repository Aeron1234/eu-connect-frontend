"use client";

import { format } from "date-fns";
import { LogIn, LogOut, Trash2 } from "lucide-react";
import DtrDeleteForm from "./DtrDeleteForm";
import Modal from "../ui/Modal";

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

function DtrTable({ dtrs = [], allowDelete = false, onDeleted }) {
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full min-w-[540px] text-sm">
        <thead>
          <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="py-2 text-left font-medium">Date</th>
            <th className="py-2 text-left font-medium">Clock In</th>
            <th className="py-2 text-left font-medium">Clock Out</th>
            <th className="py-2 text-right font-medium">Hours</th>
            <th className="py-2 text-right font-medium">Status</th>
            {allowDelete && <th className="w-10 py-2"><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {dtrs.map((dtr) => (
            <tr key={dtr.id} className="border-b border-border last:border-b-0">
              <td className="py-3 text-foreground">
                {displayDate(dtr.created_at, "MMM d, yyyy")}
              </td>
              <td className="py-3">
                {dtr.clock_in && dtr.clock_in !== "—" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    <LogIn className="size-3" />
                    {displayDate(dtr.clock_in, "h:mm a")}
                  </span>
                ) : <span className="text-foreground-soft">—</span>}
              </td>
              <td className="py-3">
                {dtr.clock_out ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-primary-emphasis">
                    <LogOut className="size-3" />
                    {displayDate(dtr.clock_out, "h:mm a")}
                  </span>
                ) : <span className="text-foreground-soft">—</span>}
              </td>
              <td className="py-3 text-right font-medium text-foreground">
                {dtr.total_hours == null ? "—" : Number(dtr.total_hours).toFixed(1)}
              </td>
              <td className="py-3 text-right">
                <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${statusStyles[dtr.status] || "bg-muted text-foreground-soft"}`}>
                  {dtr.status === "on-break" ? "On break" : dtr.status}
                </span>
              </td>
              {allowDelete && (
                <td className="py-3 pl-2 text-right">
                  <Modal
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
                  </Modal>
                </td>
              )}
            </tr>
          ))}
          {dtrs.length === 0 && (
            <tr>
              <td colSpan={allowDelete ? 6 : 5} className="py-6 text-center text-sm text-foreground-soft">
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
