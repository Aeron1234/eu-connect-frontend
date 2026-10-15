"use client";

import { forgotPasswordFormAction } from "@/lib/server-actions/auth-form-actions";
import { Spinner } from "@/components/ui/spinner";
import { useActionState } from "react";
import { ArrowRight, CheckCircle2, TriangleAlert } from "lucide-react";
import Link from "next/link";

function ForgotPasswordPageClient() {
  const [state, formAction, isPending] = useActionState(
    forgotPasswordFormAction,
    null,
  );

  return (
    <main className="flex items-center justify-center bg-canvas px-6 py-16">
      <div className="w-full max-w-md">
        <h2 className="font-display text-3xl font-bold">Reset your password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your registered email and we&apos;ll send you a temporary code.
        </p>

        {state?.success ? (
          <div className="mt-7 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-emphasis" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Check your email
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {state.message}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form className="mt-7 space-y-5" action={formAction}>
            <div>
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/80"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isPending}
                className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-700"
            >
              {isPending ? (
                <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
              ) : (
                <>
                  Send Reset Code <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {state?.error && (
              <p className="flex items-center gap-1 rounded-lg text-sm font-medium text-red-500">
                <TriangleAlert className="h-4 w-4" /> {state.error}
              </p>
            )}
          </form>
        )}

        <p className="mt-6 text-center text-sm">
          <Link
            href="/login?signin=1"
            className="font-semibold text-primary-emphasis hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}

export default ForgotPasswordPageClient;
