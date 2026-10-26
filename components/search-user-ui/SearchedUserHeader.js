"use client";

import { ChevronLeft, User, UserCheck, Clock3 } from "lucide-react";
import Link from "next/link";
import SupervisorRequestButton from "./SupervisorRequestButton";
import ProgressBar from "../ui/ProgressBar";
import PageManual from "../ui/PageManual";

// The employer sees a passive relationship label on this profile.
// Accept/decline actions live in Notifications; students use the interactive
// control below when viewing an employer.
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

function SearchedUserHeader({
  userProfile = {},
  supervision = null,
  searchedUserId = "",
  userRole = "",
  hasOngoingInternship = false,
}) {
  const totalHours = Number(userProfile?.total_hours) || 0;
  const hoursRendered = Number(userProfile?.hours_rendered) || 0;

  const percentComplete =
    totalHours > 0 ? Math.min(100, (hoursRendered / totalHours) * 100) : 0;

  // Student controls fetch current status on the client, as in search results.
  // Employer-to-student profile labels use the server's supervision prop;
  // employers respond to requests from Notifications.
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
      <div className="brand-orbit bg-primary rounded-xl border border-border shadow-sm">
        {/* Banner */}
        <div className="h-16 sm:h-20" />

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
                <PageManual page="user-profile" searchedRole={userProfile?.role} hasOngoingInternship={hasOngoingInternship} supervisionStatus={supervision?.status} onBrand />
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
                <SupervisorRequestButton employerId={searchedUserId} onBrand />
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
