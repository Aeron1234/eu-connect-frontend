"use client";

import Link from "next/link";
import { LifeBuoy, ArrowUpRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AdminSupportContacts from "./AdminSupportContacts";

export default function HelpContact() {
  const { user } = useUser();
  const employer = user?.role === "employer";
  const showAdminContacts = ["student", "department_head"].includes(user?.role);
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <LifeBuoy className="size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />
        Need more help?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-foreground-soft">
        {employer
          ? "Open Feedback & Concerns, select Create feedback, choose the category that fits your concern, and post the subject and description. You can add a screenshot or supporting attachment and follow replies in the discussion."
          : showAdminContacts ? "Contact a system administrator using an available email address or phone number below."
          : "Use your school's support channel or Search Users to find the relevant staff profile."}
      </p>
      {showAdminContacts && <AdminSupportContacts viewerId={user.id} />}
      <p className="mt-2 text-sm leading-relaxed text-foreground-soft">
        Include the page, what you were trying to do, the error message, and when it happened. Add a screenshot if it helps explain the issue.
      </p>
      <Link href={employer ? "/feedback" : "/users"} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-emphasis hover:underline">
        {employer ? "Open Feedback & Concerns" : "Search Users"} <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
