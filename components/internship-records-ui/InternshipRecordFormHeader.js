import { CircleCheck, Clock3, LockKeyhole } from "lucide-react";

export default function InternshipRecordFormHeader({ locked = false, recordStatus = "", isEditing = false, canEdit = false }) {
  const ongoing = recordStatus === "ongoing";
  const pending = recordStatus === "pending";
  const hasStatus = pending || ongoing;
  const StatusIcon = ongoing ? CircleCheck : Clock3;

  return (
    <header className="relative min-w-0 bg-linear-to-br from-primary/6 via-card to-card p-5 sm:p-6">
      <div className="min-w-0">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary-emphasis">Your placement</p>
          <div className="relative flex min-h-8 items-center">
            <h2 className={`min-w-0 w-full truncate text-sm font-medium tracking-tight text-foreground sm:text-xl sm:font-semibold ${hasStatus ? "pr-28 sm:pr-40" : ""}`}>{pending ? "Pending internship" : ongoing ? "Current internship" : "New internship record"}</h2>
            {hasStatus && (
              <span className={`absolute right-0 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full border px-2 py-1.5 text-[10px] font-medium sm:gap-1.5 sm:px-3 sm:text-[11px] sm:font-semibold ${ongoing ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "border-amber-600/20 bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}>
                <StatusIcon className="size-3 sm:size-3.5" aria-hidden="true" />
                {ongoing ? "Ongoing" : "Pending approval"}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {pending ? isEditing ? "Update your placement details below, then select Save changes. Cancel discards your unsaved changes." : "Your placement is waiting for approval. Select Edit below to update its details before it is reviewed." : locked
              ? "Your approved placement is active. Review your internship details below."
              : "Tell us about your company, schedule, and responsibilities to submit your placement for review."}
          </p>
      </div>
      {locked && (
        <div className="mt-5 flex items-start gap-2 border-t border-border/70 pt-3.5 text-xs leading-relaxed" role="status">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-primary-emphasis" aria-hidden="true" />
          <p className="text-muted-foreground">{ongoing ? <><span className="font-medium text-foreground">Read-only record.</span> Approved internship records can no longer be edited.</> : canEdit ? <><span className="font-medium text-foreground">View mode.</span> Select Edit to unlock your pending record.</> : "Loading your submitted record. Editing will be available when its details finish loading."}</p>
        </div>
      )}
    </header>
  );
}
