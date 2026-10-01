"use client";

import { ChevronLeft, User, UserCheck, Clock3, Check } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import useSupervisorRequestStatus from "./useSupervisorRequestStatus";
import ProgressBar from "./ProgressBar";

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
  const {
    supervisorStatus,
    isLoadingStatus,
    isPending,
    sendRequest,
    cancelRequest,
  } = useSupervisorRequestStatus(searchedUserId);

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
        onClick={cancelRequest}
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
      onClick={sendRequest}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-card text-primary-emphasis px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-50 transition cursor-pointer shrink-0 disabled:opacity-50"
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
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Student header card */}
      <div className="bg-primary rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-16 sm:h-20 bg-primary" />

        <div className="px-4 sm:px-6 pb-4 sm:pb-6 ">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-8 sm:-mt-10">
            <div className="shadow-lg w-14 h-14 sm:w-20 sm:h-20 rounded-xl bg-muted border-2 border-white overflow-hidden flex items-center justify-center text-foreground-subtle">
              {userProfile.avatar ? (
                <img
                  src={`/avatars/${userProfile.avatar}`}
                  alt="Avatar option"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 sm:w-9 sm:h-9" />
              )}
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
                <SupervisorButton
                  key={searchedUserId}
                  searchedUserId={searchedUserId}
                />
              </div>
            )}

            {totalHours > 0 && (
              <div className="text-left sm:text-right shrink-0 w-full sm:w-auto pb-1">
                <p className="text-2xl font-bold text-white">
                  {hoursRendered.toFixed(1)}
                  <span className="text-sm font-normal">/{totalHours} hrs</span>
                </p>

                <ProgressBar
                  value={percentComplete}
                  label="Internship hours completed"
                  onBrand
                  className="mt-1 sm:w-32"
                />

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
