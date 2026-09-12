"use client";

import { login } from "@/app/_services/student-actions";
import Logo from "./Logo";
import { Spinner } from "@/components/ui/spinner";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, TriangleAlert } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-md">
        <h2 className="font-display text-3xl font-bold">
          Sign in to your account
        </h2>

        <form className="mt-7 space-y-5" action={formAction}>
          <div>
            <label
              htmlFor="username"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/80"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="juanDelaCruz"
              disabled={isPending}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/80"
            >
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-11 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isPending}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-700"
          >
            {isPending ? (
              <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {state?.error && (
            <p className="flex gap-1 items-center text-red-500 text-sm font-medium rounded-lg">
              <TriangleAlert className="h-4 w-4" /> {state.error}
            </p>
          )}
        </form>

        <p className="mt-8 text-center text-xs text-muted-foreground/70">
          Protected by MSEUF-CI institutional credentials
        </p>
      </div>
    </main>
  );
}

export default LoginForm;
