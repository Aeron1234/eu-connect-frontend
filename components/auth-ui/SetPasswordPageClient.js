"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { setPasswordFormAction } from "@/lib/server-actions/auth-form-actions";
import { controlClass, modalFormLabelClass, modalFormPrimaryClass } from "@/components/ui/modalFormStyles";
import { cn } from "@/lib/utils";
import PasswordSetupShell, { PasswordSetupBackLink } from "./PasswordSetupShell";

function PasswordField({ id, name, label, placeholder, disabled, hint }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className={`block ${modalFormLabelClass}`}>{label}</label>
      <div className="relative mt-2">
        <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" aria-hidden="true" />
        <input id={id} name={name} type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={72} required placeholder={placeholder} disabled={disabled}
          aria-describedby={hint ? `${id}-hint` : undefined} className={cn(controlClass, "mt-0 min-h-11 pl-10 pr-12")} />
        <button type="button" disabled={disabled} onClick={() => setVisible(value => !value)} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible}
          className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60">
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      </div>
      {hint && <p id={`${id}-hint`} className="mt-2 text-xs leading-5 text-foreground-soft">{hint}</p>}
    </div>
  );
}

export default function SetPasswordPageClient({ token = "" }) {
  const [state, formAction, isPending] = useActionState(setPasswordFormAction, {});
  return (
    <PasswordSetupShell>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary-emphasis">
        <ShieldCheck className="size-3.5" aria-hidden="true" /> Account security
      </span>
      <h1 id="password-setup-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Set your password</h1>
      <p className="mt-3 text-sm leading-6 text-foreground-soft">
        {token ? "Choose a password for your EU-Connect account. After saving, sign in with your username and new password." : "Replace your temporary code with a password of your own, then sign in to continue."}
      </p>
      <form action={formAction} aria-busy={isPending} className="mt-7 space-y-5">
        {token && <input type="hidden" name="token" value={token} />}
        <PasswordField id="setup-new-password" name="newPassword" label="New password" placeholder="Enter a new password" disabled={isPending} hint="Use at least 8 characters. Avoid a password you use elsewhere." />
        <PasswordField id="setup-confirm-password" name="confirmPassword" label="Confirm password" placeholder="Re-enter your password" disabled={isPending} />
        {state?.error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{state.error}
        </p>}
        <button type="submit" disabled={isPending} className={cn(modalFormPrimaryClass, "inline-flex min-h-11 w-full items-center justify-center gap-2")}>
          {isPending ? <><Spinner className="size-4" /> Saving password...</> : <>Save password <ArrowRight className="size-4" aria-hidden="true" /></>}
        </button>
      </form>
      <div className="mt-5 text-center text-xs leading-6 text-foreground-soft">
        Need another setup link? <Link href="/forgot-password" className="font-semibold text-primary-emphasis underline-offset-4 hover:underline focus-visible:underline">Request a new link</Link>
      </div>
      <div className="mt-6 border-t border-border pt-3"><PasswordSetupBackLink /></div>
    </PasswordSetupShell>
  );
}
