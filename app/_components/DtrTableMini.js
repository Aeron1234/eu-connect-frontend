"use client";

import { format, parse, parseISO } from "date-fns";
import { XCircle } from "lucide-react";
import Modal from "./Modal";
import DtrDeleteForm from "./DtrDeleteForm";

function DtrTableMini({ dtrs }) {
  return (
    <ul className="md:hidden flex flex-col gap-3">
      {dtrs.length > 0 ? (
        dtrs.map((entry) => (
          <li
            key={entry.id}
            className={`border rounded-lg p-3 text-sm ${entry.total_hours ? "" : "bg-red-100 border-red-200"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span
                className={`font-medium ${entry.total_hours ? "text-stone-800" : "text-primary-500"}`}
              >
                {entry.created_at && format(entry.created_at, "MM/dd/yyyy")}
              </span>

              <Modal
                trigger={
                  <div className="w-fit rounded-full text-muted-foreground">
                    <XCircle className="w-4 h-4" />
                  </div>
                }
                title={
                  <span className={`text-primary-500`}>
                    Delete Daily Time Record
                  </span>
                }
                // title={<span className="text-red-600">Clock-out?</span>}
                description={`Are you sure you want to delete this daily time record?`}
              >
                <DtrDeleteForm dtrId={entry.id} />
              </Modal>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div>
                <span className="text-muted-foreground">In: </span>
                <span className={entry.total_hours ? "" : "text-primary-500"}>
                  {format(parseISO(entry.clock_in), "h:mm a")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Out: </span>
                <span className={entry.total_hours ? "" : "text-primary-500"}>
                  {(entry.clock_out &&
                    format(parseISO(entry.clock_out), "h:mm a")) ||
                    "—"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Total: </span>
                <span
                  className={`font-mono ${entry.total_hours ? "" : "text-primary-500"} italic`}
                >
                  {entry.total_hours
                    ? entry.total_hours.toFixed(2) + " hrs"
                    : "Pending..."}
                </span>
              </div>
            </div>
          </li>
        ))
      ) : (
        <li className="flex-1 p-4 text-center rounded-sm text-stone-600">
          No DTR yet
        </li>
      )}
    </ul>
  );
}

export default DtrTableMini;
