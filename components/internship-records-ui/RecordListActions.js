"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function RecordListActions({ record: r, isPending, isSearching, setConfirmation }) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      {r.status === "pending" && (
        <>
          <button
            type="button"
            disabled={isPending || isSearching}
            onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "ongoing", label: "Approve" })}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-600 transition disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={isPending || isSearching}
            onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "rejected", label: "Reject" })}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-soft hover:bg-muted transition disabled:opacity-50"
          >
            Reject
          </button>
        </>
      )}
      {r.status === "rejected" && (
        <button
          type="button"
          disabled={isPending || isSearching}
          onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "pending", label: "Restore" })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary-emphasis hover:bg-primary hover:text-white transition disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" /> Restore
        </button>
      )}
      {r.status === "ongoing" && (
        <button
          type="button"
          disabled={isPending || isSearching}
          onClick={() => setConfirmation({ id: r.id, studentName: r.student_name, status: "finished", label: "Mark Finished" })}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground-soft hover:bg-muted transition disabled:opacity-50"
        >
          Mark Finished
        </button>
      )}
      <Link
        href={`/internship-records/${r.id}`}
        className="rounded-lg bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-emphasis hover:bg-primary-100 transition"
      >
        View Record
      </Link>
    </div>
  );
}
