"use client";

import { User } from "lucide-react";
import { displayValue } from "./accountHelpers";

function AccountProfileBanner({
  name,
  isEditing,
  isNameEditable,
  onNameChange,
  subtitle,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="h-24 bg-primary-500" />
      <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-6">
        <div className="flex items-end gap-5">
          <div className="-mt-10 flex h-24 w-24 items-center justify-center rounded-xl border-4 border-background bg-secondary">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="pb-1">
            {isEditing && isNameEditable ? (
              <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="font-display text-2xl font-bold rounded-md border border-border bg-background px-2 py-1 w-full max-w-xs"
              />
            ) : (
              <h2 className="font-display text-2xl font-bold">
                {displayValue(name)}
              </h2>
            )}
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AccountProfileBanner;
