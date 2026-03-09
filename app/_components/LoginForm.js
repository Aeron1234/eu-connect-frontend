"use client";

import { login } from "@/app/_services/actions";
import Logo from "./Logo";
import { Spinner } from "@/components/ui/spinner";
import { useActionState } from "react";

function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, null);

  return (
    <form
      action={formAction}
      className="bg-white shadow-sm rounded-md text-base flex flex-col gap-6 py-5 px-8 w-full max-w-100"
    >
      <h2 className="self-center flex flex-col items-center gap-1">
        <Logo />
        <span className="font-bold">EU-Connect</span>
      </h2>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">Email</span>
        <input
          type="email"
          name="email"
          className="outline-non border border-stone-300 rounded-sm px-3 py-1"
          disabled={isPending}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-semibold">Password</span>
        <input
          type="password"
          name="password"
          className="outline-non border border-stone-300 rounded-sm px-3 py-1"
          disabled={isPending}
          required
        />
      </label>

      <label className="flex gap-1 items-center">
        <input type="checkbox" />
        <span className="text-sm font-semibold">Remember me?</span>
      </label>

      <button
        className="bg-primary-500 text-primary-50 px-4 py-2 rounded-full font-bold flex items-center justify-center"
        disabled={isPending}
      >
        {isPending ? (
          <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
        ) : (
          "Log in"
        )}
      </button>

      {state?.error && (
        <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {state.error}
        </p>
      )}
    </form>
  );
}

export default LoginForm;
