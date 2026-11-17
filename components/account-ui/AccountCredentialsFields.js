"use client";

import { hintClass, inputClass, labelClass } from "./accountFormStyles";

export default function AccountCredentialsFields({ accountForm, setAccountForm, isPending, isStudent, usernameError }) {
  return <div className="min-w-0 space-y-3">
    {isStudent && <div>
      <label htmlFor="school_id" className={labelClass}>School ID number (optional)</label>
      <input id="school_id" name="school_id" className={inputClass} value={accountForm.school_id} maxLength={30} pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" placeholder="A12-0000" disabled={isPending} onChange={event => setAccountForm(previous => ({ ...previous, school_id: event.target.value }))} />
      <p className={hintClass}>Stored on the student profile and included in their username.</p>
    </div>}
    <div>
      <label htmlFor="username" className={labelClass}>Username <span className="text-primary-emphasis">*</span></label>
      <input type="text" id="username" name="username" placeholder="juan.delacruz" className={inputClass} value={accountForm.username} onChange={event => setAccountForm(previous => ({ ...previous, username: event.target.value }))} disabled={isPending} readOnly={isStudent} maxLength={50} autoComplete="off" spellCheck={false} autoCapitalize="none" required />
      <p className={hintClass}>{isStudent ? "Generated from last name, first name and school ID. Without an ID, a numeric suffix may be assigned when saving." : "Used to sign in to EU-Connect."}</p>
    </div>
    {usernameError && <p role="alert" className="text-destructive">{usernameError}</p>}
    <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">A setup link will be emailed to the account holder. They choose their own password before signing in.</p>
  </div>;
}
