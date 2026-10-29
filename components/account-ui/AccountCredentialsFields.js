"use client";

import { hintClass, inputClass, labelClass } from "./accountFormStyles";

export default function AccountCredentialsFields({ accountForm, setAccountForm, isPending }) {
  return <div className="min-w-0 space-y-3">
    <div>
      <label htmlFor="username" className={labelClass}>Username <span className="text-primary-emphasis">*</span></label>
      <input type="text" id="username" name="username" placeholder="juan.delacruz" className={inputClass} value={accountForm.username} onChange={event => setAccountForm(previous => ({ ...previous, username: event.target.value }))} disabled={isPending} autoComplete="off" spellCheck={false} autoCapitalize="none" required />
      <p className={hintClass}>Used to sign in to EU-Connect.</p>
    </div>
    <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">A setup link will be emailed to the account holder. They choose their own password before signing in.</p>
  </div>;
}
