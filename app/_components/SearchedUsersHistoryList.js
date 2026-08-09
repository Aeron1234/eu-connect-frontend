"use client";

import { Check, Clock3, History, UserCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
} from "../_services/general-actions";
import { getSupervisorStatus } from "../_services/services";
import { toastAndAction } from "../_services/helpers";
import {
  cancelSupervisorRequest,
  requestSupervisor,
} from "../_services/student-actions";
import { Spinner } from "@/components/ui/spinner";

function SearchedUsersHistoryList({ historyData = [], userRole }) {
  async function handleClearHistory() {
    try {
      await clearSearchHistory({ type: "user" });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 justify-between text-stone-500 mb-2">
        <h3 className="flex items-center gap-1">
          <History className="h-4 w-4 text-primary-500" /> Recently Viewed
        </h3>

        <button
          className="hover:text-stone-800 cursor-pointer text-sm"
          onClick={handleClearHistory}
        >
          clear all
        </button>
      </div>
      {historyData.length > 0 && (
        <ul className="w-full flex flex-col gap-2">
          {historyData.map((history) => (
            <li className="w-full" key={history.history_id}>
              <SearchedUserHistoryItem history={history} userRole={userRole} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchedUserHistoryItem({ history, userRole }) {
  const [supervisorStatus, setSupervisorStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPending, startTransition] = useTransition();

  const showSupervisorButton =
    history.role === "employer" && userRole === "student";

  useEffect(() => {
    if (!showSupervisorButton) return;

    let cancelled = false;
    setIsLoadingStatus(true);

    getSupervisorStatus(history.searched_uuid).then((result) => {
      if (!cancelled) {
        setSupervisorStatus(result);
        setIsLoadingStatus(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showSupervisorButton, history.searched_uuid]);

  async function handleDelete() {
    try {
      await deleteSearchHistoryItem({
        type: "user",
        historyId: history.history_id,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function handleSetSupervisor(e) {
    e.stopPropagation();
    const formData = new FormData();
    formData.append("employerId", history.searched_uuid);

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

  function renderSupervisorButton() {
    // Still fetching — show a disabled placeholder with a spinner so the
    // slot doesn't stay empty and then suddenly pop in with the real button
    if (isLoadingStatus) {
      return (
        <button
          disabled
          className="inline-flex items-center gap-2 bg-primary-500 text-white border border-primary-500 px-4 py-2.5 rounded-md text-sm font-semibold shrink-0 cursor-not-allowed"
        >
          <Spinner className="w-3.5 h-3.5 stroke-3 stroke-white" />
          Loading...
        </button>
      );
    }

    if (!supervisorStatus || supervisorStatus.error) {
      return null;
    }

    if (!supervisorStatus.hasOngoingInternship) return null;

    if (supervisorStatus.status === "accepted") {
      return (
        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-md text-sm font-semibold shrink-0">
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
          className="inline-flex items-center gap-2 bg-stone-100 text-stone-600 border border-stone-300 px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-stone-200 transition cursor-pointer shrink-0 disabled:opacity-50"
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
        className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0 disabled:opacity-50"
      >
        <UserCheck className="w-3.5 h-3.5" />
        Set as Supervisor
      </button>
    );
  }

  return (
    <div className="group relative w-full bg-white rounded-xl border border-stone-200 shadow-sm hover:border-primary-500/30 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 pr-8">
        <Link
          href={`/users/${history.searched_uuid}`}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-primary-500 text-lg font-semibold shrink-0">
            {history.first_name.charAt(0).toUpperCase()}
            {history.last_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">
              {history.first_name} {history.last_name}
            </h3>
            {history.course && (
              <p className="text-sm text-muted-foreground">{history.course}</p>
            )}

            {history.role === "employer" && history.company_name ? (
              <p className="text-sm text-muted-foreground">
                {history.company_name}
              </p>
            ) : null}
          </div>
        </Link>

        {history.role === "student" && (
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-primary-500">
              {history.hours_rendered.toFixed(2)}/{history.total_hours} hrs
            </p>
          </div>
        )}

        {showSupervisorButton && renderSupervisorButton()}
      </div>

      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-stone-100 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove from history"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default SearchedUsersHistoryList;
