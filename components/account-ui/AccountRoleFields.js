"use client";

import { Building2, Check, GraduationCap, School, ShieldCheck, UserRound } from "lucide-react";

const roleDetails = {
  student: { Icon: GraduationCap, description: "Internship requirements and progress" },
  employer: { Icon: Building2, description: "Intern supervision and evaluations" },
  department_head: { Icon: School, description: "Department records and oversight" },
  admin: { Icon: ShieldCheck, description: "Accounts and system management" },
};

export default function AccountRoleFields({ roles, selectedRole, setSelectedRole, isPending, formatRolesForSelect }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-foreground">Who is this account for?</legend>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Choose an account type to show its required details.</p>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map(role => {
          const { Icon = UserRound, description = "Access to the internship workspace" } = roleDetails[role.role] || {};
          const selected = selectedRole === String(role.id);
          return (
            <label key={role.id} className="relative min-w-0 cursor-pointer">
              <input
                type="radio"
                name="role"
                value={String(role.id)}
                checked={selected}
                onChange={() => setSelectedRole(String(role.id))}
                required
                disabled={isPending}
                className="peer sr-only"
              />
              <span className="flex h-full items-start gap-3 rounded-xl border border-border bg-background p-3.5 transition-colors hover:border-primary/40 peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-3 peer-focus-visible:ring-primary/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 sm:flex-col">
                <span className="flex shrink-0 items-center">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}><Icon className="size-4" aria-hidden="true" /></span>
                </span>
                <span className="min-w-0 flex-1 pr-4 sm:pr-0">
                  <span className="block text-xs font-semibold leading-5 text-foreground sm:text-sm">{formatRolesForSelect(role.role) || role.role}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{description}</span>
                </span>
                <span className={`absolute right-3 top-3 flex size-4 items-center justify-center rounded-full border ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{selected && <Check className="size-2.5" aria-hidden="true" />}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
