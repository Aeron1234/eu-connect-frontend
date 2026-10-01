import {
  Briefcase,
  Crown,
  GraduationCap,
  ShieldBan,
  ShieldAlert,
  Users,
  User,
} from "lucide-react";
import DeactivateAccount from "./DeactivateAccount";
import ReactivateAccount from "./ReactivateAccount";
import { format } from "date-fns";

function ExistingAccountList({ filteredAccounts = [], onActionSuccess }) {
  if (filteredAccounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <Users className="size-8 text-foreground-faint" />
        <p className="text-sm font-medium text-muted-foreground">No accounts found</p>
        <p className="max-w-sm text-xs text-foreground-subtle">
          Try a different search term or filter.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {filteredAccounts.map((account) => (
        <li key={account.id}>
          <AccountCard account={account} onActionSuccess={onActionSuccess} />
        </li>
      ))}
    </ul>
  );
}

function AccountCard({ account, onActionSuccess }) {
  const {
    id,
    first_name,
    last_name,
    role,
    email,
    course_name,
    department_name,
    company_name,
    status,
    created_at,
    avatar,
  } = account;

  const isSuspended = status === "suspended";
  const isInactive = status === "inactive";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-colors hover:bg-muted/50 ${
        isInactive || isSuspended ? "opacity-70 hover:opacity-100" : ""
      }`}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground-subtle">
          {avatar ? (
            <img
              src={`/avatars/${avatar}`}
              alt="Account avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {last_name}, {first_name}
            </h3>
            <RoleTag role={role} />
            {isSuspended && <StatusTag label="Suspended" tone="red" />}
            {isInactive && <StatusTag label="Inactive" tone="stone" />}
          </div>
          <div className="mt-0.5 flex flex-col text-xs text-muted-foreground">
            {email && <span className="truncate">{email}</span>}
            {course_name && <span>Course: {course_name}</span>}
            {department_name && <span>Dept: {department_name}</span>}
            {company_name && <span>Company: {company_name}</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
        <p className="text-[11px] text-muted-foreground tracking-wide">
          Created: {format(new Date(created_at), "MMM d, yyyy")}
        </p>
        {status === "active" && (
          <DeactivateAccount id={id} onSuccess={onActionSuccess} />
        )}
        {(isInactive || isSuspended) && (
          <ReactivateAccount id={id} onSuccess={onActionSuccess} />
        )}
      </div>
    </div>
  );
}

function RoleTag({ role }) {
  const config = {
    student: {
      label: "Student",
      icon: GraduationCap,
      tone: "bg-blue-50 text-blue-700",
    },
    department_head: {
      label: "Dept. Head",
      icon: Crown,
      tone: "bg-purple-50 text-purple-700",
    },
    employer: {
      label: "Employer",
      icon: Briefcase,
      tone: "bg-emerald-50 text-emerald-700",
    },
  }[role];

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

function StatusTag({ label, tone }) {
  const toneClass =
    tone === "red" ? "bg-red-50 text-red-700" : "bg-muted text-foreground-soft";
  const Icon = tone === "red" ? ShieldAlert : ShieldBan;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${toneClass}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default ExistingAccountList;
