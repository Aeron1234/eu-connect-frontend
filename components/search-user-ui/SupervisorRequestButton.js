"use client";

import { Check, Clock3, UserCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
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
function SupervisorRequestControl({ employerId, rounded }) {
  const {
    supervisorStatus,
    isLoadingStatus,
    isPending,
    sendRequest,
    cancelRequest,
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
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 bg-primary text-white border border-primary px-4 py-2.5 ${rounded} text-sm font-semibold shrink-0 cursor-not-allowed`}
      >
        <Spinner className="w-3.5 h-3.5 stroke-3 stroke-white" />
        Loading...
      </button>
    );
  }

  if (!supervisorStatus || supervisorStatus.error) return null;
  if (!supervisorStatus.hasOngoingInternship) return null;

  if (supervisorStatus.status === "accepted") {
    return (
      <span
        className={`inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 ${rounded} text-sm font-semibold shrink-0`}
      >
        <Check className="w-3.5 h-3.5" />
        Your Supervisor
      </span>
    );
  }

  if (supervisorStatus.status === "pending") {
    return (
      <button
        onClick={handleCancelRequest}
        disabled={isPending}
        className={`inline-flex items-center gap-2 bg-muted text-foreground-soft border border-border px-4 py-2.5 ${rounded} text-sm font-semibold hover:bg-secondary transition cursor-pointer shrink-0 disabled:opacity-50`}
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
      className={`inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 ${rounded} text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0 disabled:opacity-50`}
    >
      <UserCheck className="w-3.5 h-3.5" />
      Set as Supervisor
    </button>
  );
}

function SupervisorRequestButton({ employerId, rounded = "rounded-lg" }) {
  return (
    <SupervisorRequestControl
      key={employerId}
      employerId={employerId}
      rounded={rounded}
    />
  );
}

export default SupervisorRequestButton;
