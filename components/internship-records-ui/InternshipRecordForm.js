"use client";

import { CircleAlert } from "lucide-react";
import SpinnerMini from "../ui/SpinnerMini";
import InternshipRecordFormHeader from "./InternshipRecordFormHeader";
import InternshipPlacementFields from "./InternshipPlacementFields";
import InternshipScheduleFields from "./InternshipScheduleFields";
import InternshipActivitiesFields from "./InternshipActivitiesFields";
import InternshipLocationFields from "./InternshipLocationFields";
import useInternshipRecordForm from "./useInternshipRecordForm";

function InternshipRecordForm({ regions = [], recordStatus = "", onCreated }) {
  const {
    status, showForm, setShowForm, isPending, handleAction, fieldProps, regionProps,
  } = useInternshipRecordForm(recordStatus, onCreated);

  return (
    <>
      <InternshipRecordFormHeader
        showForm={showForm}
        setShowForm={setShowForm}
      />

      {status && (
        <p className="my-5 flex items-start gap-2 rounded-lg border border-border bg-secondary/70 px-3 py-3 text-xs leading-relaxed text-muted-foreground sm:items-center sm:px-4 sm:text-sm">
          <span className="text-primary-emphasis flex-shrink-0">
            <CircleAlert className="h-5 w-5" />
          </span>
          The form is locked because you currently have an ongoing or pending
          internship record.
        </p>
      )}

      {showForm && (
        <form
          className={`relative mt-5 flex min-w-0 flex-col gap-4 sm:gap-5 ${status ? "opacity-50 pointer-events-none" : ""}`}
          action={handleAction}
        >
          <InternshipPlacementFields regions={regions} {...fieldProps} {...regionProps} />

          <InternshipScheduleFields {...fieldProps} />

          <InternshipActivitiesFields {...fieldProps} />

          <InternshipLocationFields {...fieldProps} />

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50 sm:w-auto sm:self-end"
            disabled={isPending || status}
          >
            {isPending ? (
              <span className="flex w-full justify-center">
                <SpinnerMini />
              </span>
            ) : (
              "Create Internship Record"
            )}
          </button>
        </form>
      )}
    </>
  );
}

export default InternshipRecordForm;
