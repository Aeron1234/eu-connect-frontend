"use client";

import Link from "next/link";
import { saveSearchHistory } from "../_services/general-actions";
import { getSupervisorStatus } from "../_services/services";
import { toastAndAction } from "../_services/helpers";
import { UserCheck, Clock3, Check } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import {
  cancelSupervisorRequest,
  requestSupervisor,
} from "../_services/student-actions";
import { Spinner } from "@/components/ui/spinner";

function SearchedUserItem({ searchedUser, userId, userRole }) {
  const [supervisorStatus, setSupervisorStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isPending, startTransition] = useTransition();

  const showSupervisorButton =
    searchedUser.role === "employer" && userRole === "student";

  useEffect(() => {
    if (!showSupervisorButton) return;

    let cancelled = false;
    setIsLoadingStatus(true);

    getSupervisorStatus(searchedUser.user_id).then((result) => {
      if (!cancelled) {
        setSupervisorStatus(result);
        setIsLoadingStatus(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [showSupervisorButton, searchedUser.user_id]);

  async function handleSaveHistory() {
    try {
      await saveSearchHistory({
        type: "user",
        searchedUUID: searchedUser.user_id,
      });
    } catch (err) {
      console.error(err);
    }
  }

  function handleSetSupervisor(e) {
    e.stopPropagation();
    const formData = new FormData();
    formData.append("employerId", searchedUser.user_id);

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

    // covers: no data yet, or the fetch came back as an
    // error object ({ error: "..." }) instead of a real status payload
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
    <div
      onClick={handleSaveHistory}
      className="group relative w-full bg-white rounded-xl border border-stone-200 shadow-sm hover:border-primary-500/30 transition-all"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
        <Link
          href={`/users/${searchedUser.user_id}`}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-primary-500 text-lg font-semibold shrink-0">
            {searchedUser.first_name.charAt(0).toUpperCase()}
            {searchedUser.last_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">
              {searchedUser.first_name} {searchedUser.last_name}
            </h3>
            {searchedUser?.course && (
              <p className="text-sm text-muted-foreground">
                {searchedUser.course}
              </p>
            )}

            {searchedUser.role === "employer" && searchedUser?.company_name ? (
              <p className="text-sm text-muted-foreground">
                {searchedUser.company_name}
              </p>
            ) : null}
          </div>
        </Link>

        {searchedUser.role === "student" && (
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-primary-500">
              {searchedUser.hours_rendered.toFixed(2)}/
              {searchedUser.total_hours} hrs
            </p>
          </div>
        )}

        {showSupervisorButton && renderSupervisorButton()}
      </div>
    </div>
  );
}

export default SearchedUserItem;
