"use client";

import { Check, Clock3, UserCheck } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getSupervisorStatus } from "@/lib/server-actions/supervisor-actions";
import { toastAndAction } from "../../lib/helpers";
import {
  cancelSupervisorRequest,
  requestSupervisor,
} from "@/lib/server-actions/supervisor-actions";
import { Spinner } from "@/components/ui/spinner";

/**
 * The student -> employer "supervisor" relationship for one employer:
 * fetches the current status and renders the matching control (loading,
 * "Your Supervisor", "Request Sent" / cancel, or "Set as Supervisor").
 *
 * Callers are responsible for deciding *when* to show this (viewer is a
 * student, target is an employer) — mount it only in that case, since it
 * fetches unconditionally as soon as it's rendered.
 */
function SupervisorRequestButton({ employerId, rounded = "rounded-lg" }) {
  const [supervisorStatus, setSupervisorStatus] = useState(null);
  // Starts true: this component is only ever mounted when it's about to
  // fetch, so there's no "nothing yet" state worth rendering first.
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setIsLoadingStatus(true);

    getSupervisorStatus(employerId).then((result) => {
      if (!cancelled) {
        setSupervisorStatus(result);
        setIsLoadingStatus(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [employerId]);

  function handleSetSupervisor(e) {
    e.stopPropagation();
    const formData = new FormData();
    formData.append("employerId", employerId);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Sending request...",
        successLabel: "Supervisor request sent.",
        errorLabel: "Failed to send request.",
        action: requestSupervisor,
        formData,
      });

      if (result?.success) {
        setSupervisorStatus({
          status: "pending",
          hasOngoingInternship: true,
          requestId: result.id,
        });
      }
    });
  }

  function handleCancelRequest(e) {
    e.stopPropagation();
    if (!supervisorStatus?.requestId) return; // guard against a stale/missing state

    const formData = new FormData();
    formData.append("requestId", supervisorStatus.requestId);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Cancelling request...",
        successLabel: "Request cancelled.",
        errorLabel: "Failed to cancel request.",
        action: cancelSupervisorRequest,
        formData,
      });

      if (result?.success) {
        setSupervisorStatus({ status: null, hasOngoingInternship: true });
      }
    });
  }

  if (isLoadingStatus) {
    return (
      <button
        disabled
        className={`inline-flex items-center gap-2 bg-primary-500 text-white border border-primary-500 px-4 py-2.5 ${rounded} text-sm font-semibold shrink-0 cursor-not-allowed`}
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
        className={`inline-flex items-center gap-2 bg-stone-100 text-stone-600 border border-stone-300 px-4 py-2.5 ${rounded} text-sm font-semibold hover:bg-stone-200 transition cursor-pointer shrink-0 disabled:opacity-50`}
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
      className={`inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 ${rounded} text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0 disabled:opacity-50`}
    >
      <UserCheck className="w-3.5 h-3.5" />
      Set as Supervisor
    </button>
  );
}

export default SupervisorRequestButton;
