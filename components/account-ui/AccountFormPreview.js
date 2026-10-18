import { LockKeyhole, UserRound } from "lucide-react";

export default function AccountFormPreview({ accountForm, selectedRoleName, roleLabel, course, department }) {
  const initial = accountForm.middle_initial.trim().replace(/\.$/, "").toUpperCase();
  const name = [accountForm.first_name.trim(), initial ? initial + "." : "", accountForm.last_name.trim()].filter(Boolean).join(" ");
  const initials = [accountForm.first_name.trim()[0], accountForm.last_name.trim()[0]].filter(Boolean).join("").toUpperCase();
  return (
    <aside className="min-w-0 border-t border-border bg-muted/20 p-5 sm:p-6 xl:border-l xl:border-t-0">
      <div className="xl:sticky xl:top-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Account preview</p>
        <div className="mt-5 flex items-center gap-3 xl:block">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-base font-semibold text-primary-emphasis xl:size-14">{initials || <UserRound className="size-5" aria-hidden="true" />}</div>
          <div className="min-w-0 xl:mt-4">
            <p className="break-words text-sm font-semibold leading-6 text-foreground">{name || "New account"}</p>
            <span className="mt-1.5 inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-[11px] font-medium text-primary-emphasis">{roleLabel || "No account type selected"}</span>
          </div>
        </div>
        <dl className="mt-6 space-y-4 border-t border-border pt-5 text-xs">
          <div><dt className="text-muted-foreground">Username</dt><dd className="mt-1 break-all font-medium text-foreground">{accountForm.username.trim() || "Not entered yet"}</dd></div>
          <div><dt className="text-muted-foreground">Email address</dt><dd className="mt-1 break-all font-medium text-foreground">{accountForm.email.trim() || "Not provided"}</dd></div>
          {selectedRoleName === "student" && <div><dt className="text-muted-foreground">Course</dt><dd className="mt-1 break-words font-medium text-foreground">{course?.course_name || "Not selected yet"}</dd></div>}
          {["student", "department_head"].includes(selectedRoleName) && <div><dt className="text-muted-foreground">Department</dt><dd className="mt-1 break-words font-medium text-foreground">{department?.name || "Not selected yet"}</dd></div>}
        </dl>
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border bg-card p-3.5">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-muted-foreground">Share the sign-in details with the account holder. They can update their password in their account settings.</p>
        </div>
      </div>
    </aside>
  );
}
