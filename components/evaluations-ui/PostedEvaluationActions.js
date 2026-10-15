"use client";

import { CheckCircle2, RotateCcw, MessageSquareQuote } from "lucide-react";
import ExportPdfButton from "../ui/ExportPdfButton";

export default function PostedEvaluationActions({
  ev,
  type,
  isPending,
  canPrint,
  isStaff,
  handleResponse,
  handleRestore,
  handleStaffReview,
}) {
  return (
    <>
      {type === "confirmation" && ev.status === "Pending" && (
        <div className="bg-card px-5 py-4 border-t border-border">
          <div className="flex w-full justify-end gap-2">
            <button
              onClick={() => handleResponse("disputed")}
              disabled={isPending}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Dispute
            </button>
            <button
              onClick={() => handleResponse("completed")}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept &amp; Confirm
            </button>
          </div>
        </div>
      )}

      {canPrint && (
        <div className="bg-card px-5 py-4 border-t border-border">
          <div className="flex w-full justify-end">
            <ExportPdfButton
              endpoint="/api/reports/student-evaluation"
              params={{ evaluationId: ev.id }}
              label="Export PDF"
            />
          </div>
        </div>
      )}

      {type === "disputed" && ev.status === "Disputed" && (
        <div className="bg-card px-5 py-4 border-t border-border">
          <div className="flex w-full justify-end gap-2">
            <button
              onClick={handleRestore}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4" /> Restore
            </button>
          </div>
        </div>
      )}

      {isStaff && ev.status === "Disputed" && (
        <div className="bg-card px-5 py-4 border-t border-border">
          <form
            className="flex w-full justify-end gap-2"
            action={handleStaffReview}
          >
            <textarea
              className="text-sm text-foreground-soft italic leading-relaxed border border-border rounded-lg w-full outline-none bg-muted px-4 max-w-100 resize-none focus:border-primary"
              name="review_notes"
              defaultValue={ev?.review_notes || ""}
              disabled={isPending}
            />

            <button
              type="submitt"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageSquareQuote className="h-4 w-4" /> Submitt Review
            </button>
          </form>
        </div>
      )}
    </>
  );
}
