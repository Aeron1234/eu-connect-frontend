"use client";

import { hintClass, inputClass, labelClass } from "./accountFormStyles";

export default function AccountIdentityFields({ accountForm, setAccountForm, isPending }) {
  const change = (field) => (event) => setAccountForm(previous => ({ ...previous, [field]: event.target.value }));
  return (
    <div className="space-y-5">
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]">
        <div className="min-w-0">
          <label htmlFor="first_name" className={labelClass}>First name <span className="text-primary-emphasis">*</span></label>
          <input type="text" id="first_name" name="first_name" placeholder="Juan" className={inputClass} value={accountForm.first_name} onChange={change("first_name")} disabled={isPending} autoComplete="given-name" required />
        </div>
        <div className="min-w-0">
          <label htmlFor="middle_initial" className={labelClass}>M.I. <span className="font-normal text-muted-foreground">(optional)</span></label>
          <input type="text" id="middle_initial" name="middle_initial" placeholder="A." className={inputClass + " uppercase"} maxLength={2} pattern="[A-Za-z][.]?" title="Enter one letter, optionally followed by a period." value={accountForm.middle_initial} onChange={change("middle_initial")} disabled={isPending} aria-describedby="middle-initial-help" />
        </div>
        <div className="min-w-0">
          <label htmlFor="last_name" className={labelClass}>Last name <span className="text-primary-emphasis">*</span></label>
          <input type="text" id="last_name" name="last_name" placeholder="Dela Cruz" className={inputClass} value={accountForm.last_name} onChange={change("last_name")} disabled={isPending} autoComplete="family-name" required />
        </div>
      </div>
      <p id="middle-initial-help" className="text-xs leading-relaxed text-muted-foreground">Enter one letter for the middle initial, or leave it blank.</p>
      <div>
        <label htmlFor="email" className={labelClass}>Email address <span className="text-primary-emphasis">*</span></label>
        <input type="email" id="email" name="email" placeholder="juan@example.com" className={inputClass} value={accountForm.email} onChange={change("email")} disabled={isPending} autoComplete="email" aria-describedby="account-email-help" required />
        <p id="account-email-help" className={hintClass}>A valid email address lets the account holder recover their password.</p>
      </div>
    </div>
  );
}
