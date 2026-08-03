"use client";

import { login } from "@/app/_services/student-actions";
import Logo from "./Logo";
import { Spinner } from "@/components/ui/spinner";
import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, TriangleAlert } from "lucide-react";

const roles = [
  {
    key: "student",
    label: "Student",
    placeholder: "student@mseuf.edu.ph",
    hint: "Use your university student ID email",
  },
  {
    key: "dept",
    label: "Dept. Head",
    placeholder: "depthead@mseuf.edu.ph",
    hint: "Use your department email account",
  },
  {
    key: "employer",
    label: "Employer",
    placeholder: "hr@company.com",
    hint: "Use your registered company email",
  },
  {
    key: "admin",
    label: "Admin",
    placeholder: "admin@mseuf.edu.ph",
    hint: "Administrator access only",
  },
];

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);
  const [role, setRole] = useState(roles[0]);
  const [showPassword, setShowPassword] = useState(false);

  // return (
  //   <form
  //     action={formAction}
  //     className="bg-white shadow-sm rounded-md text-base flex flex-col gap-6 py-5 px-8 w-full max-w-100"
  //   >
  //     <h2 className="self-center flex flex-col items-center gap-1">
  //       <Logo />
  //       <span className="font-bold">EU-Connect</span>
  //     </h2>

  //     <label className="flex flex-col gap-1">
  //       <span className="font-semibold">Email</span>
  //       <input
  //         type="email"
  //         name="email"
  //         className="outline-non border border-stone-300 rounded-sm px-3 py-1"
  //         disabled={isPending}
  //         required
  //       />
  //     </label>

  //     <label className="flex flex-col gap-1">
  //       <span className="font-semibold">Password</span>
  //       <input
  //         type="password"
  //         name="password"
  //         className="outline-non border border-stone-300 rounded-sm px-3 py-1"
  //         disabled={isPending}
  //         required
  //       />
  //     </label>

  //     <label className="flex gap-1 items-center">
  //       <input type="checkbox" />
  //       <span className="text-sm font-semibold">Remember me?</span>
  //     </label>

  //     <button
  //       className="bg-primary-500 text-primary-50 px-4 py-2 rounded-full font-bold flex items-center justify-center"
  //       disabled={isPending}
  //     >
  //       {isPending ? (
  //         <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
  //       ) : (
  //         "Log in"
  //       )}
  //     </button>

  //     {state?.error && (
  //       <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
  //         {state.error}
  //       </p>
  //     )}
  //   </form>
  // );

  return (
    <main className="flex items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-md">
        <h2 className="font-display text-3xl font-bold">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Select your role and enter your credentials
        </p>

        <div className="mt-8 grid grid-cols-4 gap-1 rounded-lg border border-border bg-secondary p-1">
          {roles.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRole(r)}
              disabled={isPending}
              className={`rounded-md px-2 py-2.5 text-sm font-medium transition-colors ${
                role.key === r.key
                  ? "bg-background font-semibold text-primary-500 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form className="mt-7 space-y-5" action={formAction}>
          <div>
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground/80"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={role.placeholder}
              disabled={isPending}
              className="mt-2 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/40"
            />
            <p className="mt-2 text-xs text-muted-foreground">{role.hint}</p>
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
              <button
                type="button"
                disabled={isPending}
                className="text-xs font-semibold text-primary-500 hover:underline"
              >
                Forgot password?
              </button>
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
