"use client";

import { useState } from "react";
import { Check, Clock3, UserCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useSupervisorRequestStatus from "../../lib/hooks/useSupervisorRequestStatus";

/**
 * The student -> employer "supervisor" relationship for one employer:
 * fetches the current status and renders the matching control (loading,
 * "Your Supervisor", "Request Sent" / cancel, or "Set as Supervisor").
 *
 * Callers are responsible for deciding *when* to show this (viewer is a
 * student, target is an employer) — mount it only in that case, since it
 * fetches unconditionally as soon as it's rendered.
 */
function SupervisorRequestControl({ employerId, rounded, onBrand }) {
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const {
    supervisorStatus,
    isLoadingStatus,
    isPending,
    sendRequest,
    cancelRequest,
    unsetSupervisor,
  } = useSupervisorRequestStatus(employerId);

  function handleSetSupervisor(e) {
    e.stopPropagation();
    sendRequest();
  }

  function handleCancelRequest(e) {
    e.stopPropagation();
    cancelRequest();
  }

  if (isLoadingStatus) {
    return <Skeleton className={`h-10 w-40 shrink-0 ${rounded}`} role="status" aria-label="Loading supervisor status" />;
  }

  if (!supervisorStatus || supervisorStatus.error) return null;
  if (!supervisorStatus.hasOngoingInternship) return null;

  if (supervisorStatus.status === "accepted") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex shrink-0 items-center gap-2 border px-3 py-2 text-sm font-semibold ${rounded} ${onBrand ? "border-white/30 bg-white/15 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"}`}>
          <Check className="size-3.5" /> Your Supervisor
        </span>
        <button
          type="button"
          onClick={(event) => { event.stopPropagation(); setConfirmingRemoval(true); }}
          disabled={isPending}
          className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${onBrand ? "border-white/30 text-white hover:bg-white/15" : "border-border text-foreground-soft hover:bg-muted"}`}
        >
          Remove supervisor
        </button>
        <ConfirmDialog
          open={confirmingRemoval}
          onOpenChange={setConfirmingRemoval}
          title="Remove supervisor?"
          description="This employer will no longer be assigned to your ongoing internship. You can request another supervisor afterward."
          confirmLabel="Remove supervisor"
          pending={isPending}
          onConfirm={unsetSupervisor}
        />
      </div>
    );
  }

  if (supervisorStatus.hasSupervisor) return null;

  if (supervisorStatus.status === "pending") {
    return (
      <button
        onClick={handleCancelRequest}
        disabled={isPending}
        className={`inline-flex items-center gap-2 border px-4 py-2.5 ${rounded} text-sm font-semibold transition cursor-pointer shrink-0 disabled:opacity-50 ${onBrand ? "border-white/30 bg-white/15 text-white hover:bg-white/25" : "border-border bg-muted text-foreground-soft hover:bg-secondary"}`}
      >
        <Clock3 className="w-3.5 h-3.5" />
        Request Sent
      </button>
    );
  }

  return (
    <button
      onClick={handleSetSupervisor}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-4 py-2.5 ${rounded} text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0 disabled:opacity-50 ${onBrand ? "bg-card text-primary-emphasis" : "bg-primary text-white"}`}
    >
      <UserCheck className="w-3.5 h-3.5" />
      Set as Supervisor
    </button>
  );
}

function SupervisorRequestButton({ employerId, rounded = "rounded-lg", onBrand = false }) {
  return (
    <SupervisorRequestControl
      key={employerId}
      employerId={employerId}
      rounded={rounded}
      onBrand={onBrand}
    />
  );
}

export default SupervisorRequestButton;
