"use client";

import Link from "next/link";
import {
  GraduationCap,
  Briefcase,
  Crown,
  ShieldCheck,
  User,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import SupervisorRequestButton from "./SupervisorRequestButton";

const roleConfig = {
  student: {
    label: "Student",
    icon: GraduationCap,
    tone: "bg-blue-50 text-blue-700",
  },
  employer: {
    label: "Employer",
    icon: Briefcase,
    tone: "bg-emerald-50 text-emerald-700",
  },
  department_head: {
    label: "Dept. Head",
    icon: Crown,
    tone: "bg-purple-50 text-purple-700",
  },
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    tone: "bg-stone-100 text-stone-700",
  },
};

export function RoleTag({ role }) {
  const config = roleConfig[role];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${config.tone}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

/**
 * Shared "user card" layout used by both the live search results
 * (SearchedUserItem) and the search history list (SearchedUsersHistoryList).
 *
 * Callers own click-to-record-history behavior, field-name mapping
 * (e.g. `user_id` vs `searched_uuid`), and any extra controls via `actions`
 * (e.g. the history list's delete button).
 */
function UserCard({
  userId,
  firstName,
  lastName,
  role,
  course,
  companyName,
  totalHours,
  hoursRendered,
  department,
  avatar = null,
  onClick,
  actions,
  className = "",
}) {
  const { user } = useUser();
  const viewerRole = user?.role;

  const showSupervisorButton = role === "employer" && viewerRole === "student";

  const total = Number(totalHours) || 0;
  const rendered = Number(hoursRendered) || 0;

  const percentComplete =
    role === "student" && total > 0
      ? Math.min(100, (rendered / total) * 100)
      : null;

  return (
    <div
      onClick={onClick}
      className={`group relative w-full bg-white rounded-xl border border-stone-300 shadow-sm hover:shadow-md hover:border-primary-300 transition-all ${className}`}
    >
      <div
        className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 ${
          actions ? "pr-9 sm:pr-10" : ""
        }`}
      >
        <Link
          href={`/users/${userId}`}
          className="flex items-start sm:items-center gap-3 flex-1 min-w-0"
        >
          <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-xl bg-stone-100 border-2 border-primary-100 overflow-hidden flex items-center justify-center text-stone-400">
            {avatar ? (
              <img
                src={`/avatars/${avatar}`}
                alt="Avatar option"
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="w-7 h-7 sm:w-9 sm:h-9" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-stone-800 truncate">
                {firstName} {lastName}
              </h3>
              <RoleTag role={role} />
            </div>

            <div className="flex flex-col text-sm text-stone-500 mt-0.5">
              {course && <span>{course}</span>}
              {role === "employer" && companyName && <span>{companyName}</span>}
              {["student", "department_head"].includes(role) && (
                <span>{department}</span>
              )}
            </div>

            {percentComplete !== null && (
              <div className="flex items-center gap-2 mt-2 max-w-xs">
                <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-stone-600 whitespace-nowrap">
                  {rendered.toFixed(1)}/{total} hrs
                </span>
              </div>
            )}
          </div>
        </Link>

        {showSupervisorButton && (
          <div className="sm:pl-2 flex-shrink-0">
            <SupervisorRequestButton employerId={userId} rounded="rounded-lg" />
          </div>
        )}
      </div>

      {actions}
    </div>
  );
}

export default UserCard;
