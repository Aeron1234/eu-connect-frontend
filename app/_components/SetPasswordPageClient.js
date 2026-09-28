"use client";

import { useActionState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { KeyRound, TriangleAlert } from "lucide-react";
import { setPassword } from "@/lib/server-actions/auth";

const initialState = {};

export default function SetPasswordPageClient() {
  const [state, formAction, isPending] = useActionState(
    setPassword,
    initialState,
  );

  return (
    <main className="flex items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-md">
        <h2 className="font-display text-3xl font-bold">Set a new password</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You signed in with a temporary code. Choose a permanent password to
          continue.
        </p>

        <div className="mt-7 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <KeyRound className="size-4 text-primary-500" /> New Password
          </div>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                required
                placeholder="At least 8 characters"
                disabled={isPending}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                placeholder="Re-enter your new password"
                disabled={isPending}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
              />
            </div>

            {state?.error && (
              <p className="flex items-center gap-1.5 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
                <TriangleAlert className="h-4 w-4 flex-shrink-0" />{" "}
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary-500 text-sm font-medium text-primary-foreground hover:bg-primary-500/90 disabled:opacity-50"
            >
              {isPending ? (
                <Spinner className={"size-5 stroke-3 stroke-primary-50"} />
              ) : (
                "Set New Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
