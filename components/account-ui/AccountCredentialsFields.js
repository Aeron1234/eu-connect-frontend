"use client";

import { Eye, EyeOff } from "lucide-react";
import { labelClass, inputClass } from "./accountFormStyles";

export default function AccountCredentialsFields({
  accountForm, setAccountForm, isPending,
  isFocused, setIsFocused, show, setShow,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 items-start">
      <div>
        <label htmlFor="username" className={labelClass}>
          Username *
        </label>
        <input
          type="text"
          id="username"
          name="username"
          placeholder="jdc_cnahs"
          className={inputClass}
          value={accountForm.username}
          onChange={(e) =>
            setAccountForm((prev) => ({
              ...prev,
              username: e.target.value,
            }))
          }
          disabled={isPending}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Temporary Password *
        </label>
        <div
          className={`mt-1 flex h-10 items-center gap-1 w-full rounded-md border border-border bg-background px-3 shadow-none ${isFocused ? "outline-none ring-2 ring-primary-300 border-transparent" : ""} transition-all`}
        >
          <input
            type={!show ? "password" : "text"}
            id="password"
            name="password"
            placeholder="minimum 8 characters"
            className="flex-1 outline-none bg-transparent text-sm"
            minLength={8}
            value={accountForm.password}
            onChange={(e) =>
              setAccountForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isPending}
            required
          />
          <div
            className={`justify-self-end cursor-pointer hover:bg-secondary rounded-md p-1 transition-all text-muted-foreground ${isPending ? "pointer-events-none hidden cursor-normal opacity-0" : ""}`}
            onClick={() => setShow((val) => !val)}
          >
            {show ? (
              <EyeOff className="h-4 w-5" />
            ) : (
              <Eye className="h-4 w-5" />
            )}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email Address (optional)
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="user@email.com"
          className={inputClass}
          value={accountForm.email}
          onChange={(e) =>
            setAccountForm((prev) => ({ ...prev, email: e.target.value }))
          }
          disabled={isPending}
        />
      </div>
    </div>
  );
}
