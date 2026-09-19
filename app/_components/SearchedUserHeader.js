"use client";

import {
  ChevronLeft,
  User,
  UserCheck,
  Clock3,
  ShieldCheck,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { getSupervisorStatus } from "../_services/services";
import { toastAndAction } from "../_services/helpers";
import {
  cancelSupervisorRequest,
  requestSupervisor,
} from "../_services/student-actions";
import { Spinner } from "@/components/ui/spinner";

// Keyed by direction first, then status — the same "accepted" reads
// differently depending on which side of the relationship is looking.
// Only used for the direction the viewer can't act on (employer viewing
// a student who requested them) — the other direction gets its own
// interactive button below.
const supervisionTagConfig = {
  viewer_is_supervisor: {
    accepted: { label: "Your intern", icon: UserCheck },
    pending: { label: "Requested you", icon: Clock3 },
  },
};

function SupervisionTag({ supervision }) {
  const config =
    supervisionTagConfig[supervision?.direction]?.[supervision?.status];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white ring-1 ring-white/30">
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function SupervisorButton({ searchedUserId }) {
  const [supervisorStatus, setSupervisorStatus] = useState(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    setIsLoadingStatus(true);

    getSupervisorStatus(searchedUserId).then((result) => {
      if (!cancelled) {
        setSupervisorStatus(result);
        setIsLoadingStatus(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [searchedUserId]);

  function handleSetSupervisor() {
    const formData = new FormData();
    formData.append("employerId", searchedUserId);

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

  function handleCancelRequest() {
    if (!supervisorStatus?.requestId) return;

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
        className="inline-flex items-center gap-2 bg-white/15 text-white ring-1 ring-white/30 px-4 py-2.5 rounded-lg text-sm font-semibold shrink-0 cursor-not-allowed"
      >
        <Spinner className="w-3.5 h-3.5 stroke-3 stroke-white" />
        Loading...
      </button>
    );
  }

  if (!supervisorStatus || supervisorStatus.error) return null;
  if (!supervisorStatus.hasOngoingInternship) return null;

  // Already this employer's intern — tag only, no button needed.
  if (supervisorStatus.status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-white ring-1 ring-white/30 shrink-0">
        <Check className="h-3 w-3" />
        Your Supervisor
      </span>
    );
  }

  if (supervisorStatus.status === "pending") {
    return (
      <button
        onClick={handleCancelRequest}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-white/15 text-white ring-1 ring-white/30 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white/25 transition cursor-pointer shrink-0 disabled:opacity-50"
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
      className="inline-flex items-center gap-2 bg-white text-primary-500 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-50 transition cursor-pointer shrink-0 disabled:opacity-50"
    >
      <UserCheck className="w-3.5 h-3.5" />
      Set as Supervisor
    </button>
  );
}

function SearchedUserHeader({
  userProfile = {},
  supervision = null,
  searchedUserId = "",
  userRole = "",
}) {
  const totalHours = Number(userProfile?.total_hours) || 0;
  const hoursRendered = Number(userProfile?.hours_rendered) || 0;

  const percentComplete =
    totalHours > 0 ? Math.min(100, (hoursRendered / totalHours) * 100) : 0;

  // The student-facing "am I this employer's intern / did I request them"
  // flow needs live, interactive status — fetched client-side, same as
  // SearchedUserItem. The reverse (employer viewing a student who
  // requested them) stays a passive tag from the server-computed
  // `supervision` prop, since only the student side can act on this.
  const showSupervisorButton =
    userRole === "student" && userProfile?.role === "employer";

  return (
    <div className="w-full">
      {/* Back button */}
      <Link
        href={"/users"}
        className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Student header card */}
      <div className="bg-primary-500 rounded-xl border border-stone-300 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-16 sm:h-20 bg-primary-500" />

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-8 sm:-mt-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 border-2 border-white flex items-center justify-center text-stone-400 shrink-0">
              <User className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="min-w-0 text-lg font-semibold text-white truncate">
                  {userProfile.first_name} {userProfile.last_name}
                </h1>
                {!showSupervisorButton && (
                  <SupervisionTag supervision={supervision} />
                )}
              </div>

              {userProfile?.role === "student" && (
                <p className="text-sm text-white">
                  {userProfile?.course || "Course not specified"}
                </p>
              )}

              {userProfile?.role === "department_head" && (
                <p className="text-sm text-white">
                  Department head of{" "}
                  {userProfile?.department || "Department not specified"}
                </p>
              )}

              {userProfile?.company_name &&
                userProfile?.role === "employer" && (
                  <p className="text-sm text-white">
                    {userProfile.company_name}
                  </p>
                )}

              {userProfile?.department && userProfile?.role === "student" && (
                <p className="text-sm text-white">{userProfile.department}</p>
              )}
            </div>

            {showSupervisorButton && (
              <div className="shrink-0 pb-1">
                <SupervisorButton searchedUserId={searchedUserId} />
              </div>
            )}

            {totalHours > 0 && (
              <div className="text-left sm:text-right shrink-0 w-full sm:w-auto pb-1">
                <p className="text-2xl font-bold text-white">
                  {hoursRendered.toFixed(1)}
                  <span className="text-sm font-normal">/{totalHours} hrs</span>
                </p>

                <div className="w-full sm:w-32 h-2 bg-primary-300 rounded-full mt-1">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>

                <p className="text-xs text-white mt-1">
                  {percentComplete.toFixed(1)}% completed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchedUserHeader;
