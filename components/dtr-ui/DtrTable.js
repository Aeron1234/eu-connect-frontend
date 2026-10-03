"use client";

import { format, parseISO } from "date-fns";
import { LogIn, LogOut, Trash2 } from "lucide-react";
import DtrDeleteForm from "./DtrDeleteForm";
import Modal from "../ui/Modal";
import Pagination from "../ui/Pagination";

const statusStyles = {
  present: "text-emerald-700 bg-emerald-50",
  "on-break": "text-amber-700 bg-amber-50",
  "Half Day": "text-amber-700 bg-amber-50",
  absent: "text-primary-emphasis bg-accent",
};

function formatDate(dateString, formatString = "MM/dd/yyyy") {
  const date = new Date(dateString);
  return format(date, formatString);
}

function DtrTable({
  dtrs = [],
  totalPages = 1,
  currentDtrPage = 1,
  searchedUserId = "",
  isStudentDashboard = true,
}) {
  const hrefPrev = isStudentDashboard
    ? `/student?d_page=${currentDtrPage - 1}`
    : `/users/${searchedUserId}?filter=dtr&d_page=${currentDtrPage - 1}`;

  const hrefNext = isStudentDashboard
    ? `/student?d_page=${currentDtrPage + 1}`
    : `/users/${searchedUserId}?filter=dtr&d_page=${currentDtrPage + 1}`;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-xl md:w-full text-sm overflow-x-auto">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="text-left py-2 font-medium">Date</th>
              <th className="text-left py-2 font-medium">Clock In</th>
              <th className="text-left py-2 font-medium">Clock Out</th>
              <th className="text-right py-2 font-medium">Hours</th>
              <th className="text-right py-2 font-medium">Status</th>
              {searchedUserId ? null : <th className="py-2 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {dtrs.map((dtr, i) => (
              <tr
                key={dtr.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="py-3 text-foreground">
                  {formatDate(dtr.created_at, "MMM d, yyyy")}
                </td>
                <td className="py-3">
                  {dtr.clock_in === "—" ? (
                    <span className="text-foreground-soft">—</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
                      <LogIn className="w-3 h-3" />
                      {formatDate(dtr.clock_in, "h:mm a")}
                    </span>
                  )}
                </td>
                <td className="py-3">
                  {!dtr.clock_out ? (
                    <span className="text-foreground-soft">—</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-accent text-primary-emphasis text-xs font-medium">
                      <LogOut className="w-3 h-3" />
                      {formatDate(dtr.clock_out, "h:mm a")}
                    </span>
                  )}
                </td>
                <td className="py-3 text-right text-foreground font-medium">
                  {dtr.total_hours ? dtr.total_hours.toFixed(1) : "—"}
                </td>
                <td className="py-3 text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${statusStyles[dtr.status]}`}
                  >
                    {dtr.status === "on-break" ? "On break" : dtr.status}
                  </span>
                </td>
                {searchedUserId ? null : (
                  <td className="py-3 pl-2 text-right">
                    <Modal
                      trigger={
                        <div
                          title="Delete record"
                          className="text-foreground-subtle hover:text-primary-emphasis transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </div>
                      }
                      title={
                        <span className={`text-primary-emphasis`}>
                          Delete Daily Time Record
                        </span>
                      }
                      // title={<span className="text-red-600">Clock-out?</span>}
                      description={`Are you sure you want to delete this daily time record?`}
                    >
                      <DtrDeleteForm dtrId={dtr.id} />
                    </Modal>
                  </td>
                )}
              </tr>
            ))}
            {dtrs.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-sm text-foreground-soft"
                >
                  No time records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        colSpan={6}
        className="mt-6 w-full flex justify-end text-sm text-foreground-soft"
      >
        <Pagination
          currentPage={currentDtrPage}
          totalPages={totalPages}
          hrefPrev={hrefPrev}
          hrefNext={hrefNext}
        />
        {/* <span>See all</span> */}
      </div>
    </>
  );
}

export default DtrTable;
