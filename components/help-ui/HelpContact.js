"use client";

import Link from "next/link";
import { LifeBuoy, ArrowUpRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export default function HelpContact() {
  const { user } = useUser();
  const employer = user?.role === "employer";
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <LifeBuoy className="size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />
        Need more help?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-foreground-soft">
        {employer
          ? "Use Feedback & Concerns to report a technical issue to Admin or discuss a tagged intern with their department head."
          : "Contact your department head or system administrator through your school's support channel. Search Users can help you find their profile."}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground-soft">
        Include the page, what you were trying to do, the error message, and when it happened. Add a screenshot if it helps explain the issue.
      </p>
      <Link href={employer ? "/feedback" : "/users"} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-emphasis hover:underline">
        {employer ? "Open Feedback & Concerns" : "Search Users"} <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
