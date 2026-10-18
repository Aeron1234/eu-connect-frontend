"use client";

import { Eye, EyeOff } from "lucide-react";
import { hintClass, inputClass, labelClass } from "./accountFormStyles";

export default function AccountCredentialsFields({ accountForm, setAccountForm, isPending, show, setShow }) {
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:grid-cols-2">
      <div className="min-w-0">
        <label htmlFor="username" className={labelClass}>Username <span className="text-primary-emphasis">*</span></label>
        <input type="text" id="username" name="username" placeholder="juan.delacruz" className={inputClass} value={accountForm.username} onChange={event => setAccountForm(previous => ({ ...previous, username: event.target.value }))} disabled={isPending} autoComplete="off" spellCheck={false} autoCapitalize="none" required />
        <p className={hintClass}>Used to sign in to EU-Connect.</p>
      </div>
      <div className="min-w-0">
        <label htmlFor="password" className={labelClass}>Temporary password <span className="text-primary-emphasis">*</span></label>
        <div className="flex h-11 min-w-0 items-center rounded-lg border border-border bg-background shadow-xs transition-[border-color,box-shadow] hover:border-primary/30 focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
          <input type={show ? "text" : "password"} id="password" name="password" placeholder="At least 8 characters" className="h-full min-w-0 flex-1 bg-transparent pl-3.5 pr-1 text-sm text-foreground outline-none placeholder:text-foreground-subtle disabled:cursor-not-allowed disabled:opacity-50" minLength={8} value={accountForm.password} onChange={event => setAccountForm(previous => ({ ...previous, password: event.target.value }))} disabled={isPending} autoComplete="new-password" aria-describedby="account-password-help" required />
          <button type="button" onClick={() => setShow(value => !value)} disabled={isPending} aria-label={show ? "Hide temporary password" : "Show temporary password"} aria-pressed={show} className="mr-1 flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50">{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
        </div>
        <p id="account-password-help" className={hintClass}>At least 8 characters. The account holder can change it later.</p>
      </div>
    </div>
  );
}
