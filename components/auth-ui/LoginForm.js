"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";
import { login } from "@/lib/server-actions/auth";
import { Spinner } from "@/components/ui/spinner";

const inputClassName =
  "h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-foreground-subtle focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:pl-12 sm:pr-4 sm:text-sm";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full bg-transparent px-4 py-5 sm:px-10 sm:py-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary-emphasis sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
            <ShieldCheck className="size-3.5 sm:size-4" aria-hidden="true" /> Secure school access
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:mt-5 sm:text-4xl">Welcome back.</h2>
          <p className="mt-2 text-[13px] leading-5 text-foreground-soft sm:mt-3 sm:text-sm sm:leading-7">
            Sign in with your EU-Connect credentials to continue your OJT work.
          </p>

          <form action={formAction} className="mt-5 space-y-3 sm:mt-8 sm:space-y-5">
            <div>
              <label htmlFor="username" className="block text-[13px] font-semibold text-foreground sm:text-sm">Username</label>
              <div className="relative mt-1.5 sm:mt-2">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle sm:left-4 sm:size-5" aria-hidden="true" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  disabled={isPending}
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="password" className="text-[13px] font-semibold text-foreground sm:text-sm">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary-emphasis underline-offset-4 hover:underline focus-visible:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5 sm:mt-2">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle sm:left-4 sm:size-5" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={isPending}
                  className={`${inputClassName} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isPending}
                  className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-foreground-subtle transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-60"
                >
                  {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {state?.error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:h-14 sm:px-5 sm:text-sm"
            >
              {isPending ? <><Spinner className="size-5 stroke-3 stroke-primary-50" /> Signing in...</> : <>Sign in <ArrowRight className="size-4" aria-hidden="true" /></>}
            </button>
          </form>

          <div className="mt-5 border-t border-border pt-4 text-center text-[11px] leading-4 text-foreground-soft sm:mt-7 sm:pt-6 sm:text-xs sm:leading-5">
            Access is limited to the MSEUF-CI OJT community and authorized partner supervisors.
          </div>
    </div>
  );
}
