"use client";

import { ArrowRight, Pencil, Save } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import InternshipRecordFormHeader from "./InternshipRecordFormHeader";
import InternshipPlacementFields from "./InternshipPlacementFields";
import InternshipScheduleFields from "./InternshipScheduleFields";
import InternshipActivitiesFields from "./InternshipActivitiesFields";
import InternshipLocationFields from "./InternshipLocationFields";
import InternshipFormPreview from "./InternshipFormPreview";
import useInternshipRecordForm from "./useInternshipRecordForm";

function InternshipRecordForm({ regions = [], recordStatus = "", activeRecord = null, onCreated, onUpdated, onConflict }) {
  const {
    status, canEdit, isEditing, isCurrentRecord, isPending, handleAction, startEditing, cancelEditing, fieldProps, regionProps,
  } = useInternshipRecordForm({ recordStatus, onCreated, onUpdated, onConflict, activeRecord });

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card text-sm shadow-sm">
      <InternshipRecordFormHeader locked={status} recordStatus={recordStatus} isEditing={isEditing} canEdit={canEdit} />

        <form
          id="internship-record-form"
          className="border-t border-border"
          action={handleAction}
          aria-busy={isPending}
        >
          <div className="grid min-w-0 xl:grid-cols-[minmax(0,1fr)_17rem]">
            <fieldset disabled={isPending || status} className={`min-w-0 space-y-7 p-5 sm:space-y-8 sm:p-6 lg:p-7 ${status ? "opacity-50 pointer-events-none" : ""}`}>
              <legend className="sr-only">Internship record details</legend>
              <InternshipPlacementFields regions={regions} {...fieldProps} {...regionProps} />
              <div className="border-t border-border" />
              <InternshipScheduleFields {...fieldProps} />
              <div className="border-t border-border" />
              <InternshipActivitiesFields {...fieldProps} />
              <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-4">
                <input type="checkbox" className="mt-1 accent-primary" checked={fieldProps.internshipForm.rotations_enabled} onChange={event => fieldProps.setInternshipForm(previous => ({ ...previous, rotations_enabled: event.target.checked }))} />
                <span className="min-w-0"><span className="block text-sm font-semibold">This internship includes company rotations</span><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">Optional for any department. Track assignments across units within the same company. You can enable this later.</span></span>
              </label>
              <div className="border-t border-border" />
              <InternshipLocationFields {...fieldProps} />
            </fieldset>
            <InternshipFormPreview internshipForm={fieldProps.internshipForm} recordStatus={recordStatus} isEditing={isEditing} region={regions.find((region) => String(region.id) === regionProps.selectedRegion)} />
          </div>
          <div className="flex flex-col gap-3 border-t border-border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs leading-relaxed text-muted-foreground">{status ? "Your saved internship details are shown above." : <><span className="font-semibold text-primary-emphasis">*</span> Required fields. Company website is optional.</>}</p>
            {(!isCurrentRecord || canEdit) && (
            <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center">
            {isEditing && (
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isPending}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
            )}
            {canEdit && !isEditing ? (
              <button
                key="edit"
                type="button"
                onClick={(event) => { event.preventDefault(); startEditing(); }}
                disabled={isPending}
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                Edit <Pencil className="size-4" aria-hidden="true" />
              </button>
            ) : (
            <button
              key="submit"
              type="submit"
              className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              disabled={isPending || status}
            >
              {isPending ? (
                <><Spinner className="size-4" /> {isEditing ? "Saving changes..." : "Creating record..."}</>
              ) : (
                isEditing ? <>Save changes <Save className="size-4" aria-hidden="true" /></> : <>Create Internship Record <ArrowRight className="size-4" aria-hidden="true" /></>
              )}
            </button>
            )}
            </div>
            )}
          </div>
        </form>
    </div>
  );
}

export default InternshipRecordForm;
