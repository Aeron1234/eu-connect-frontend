"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CalendarDays, Clock, GraduationCap } from "lucide-react";
import ProgressBar from "../ui/ProgressBar";
import StatusPill from "./RecordStatusPill";
import RecordListActions from "./RecordListActions";

export default function RecordListCard({ record: r, isPending, isSearching, setConfirmation }) {
  return (
    <article
      key={r.id}
      className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <Link
          href={`/department_head/internship-records/${r.id}`}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base sm:text-lg font-bold text-primary-emphasis">
              {r.student_name}
            </h2>
            {r?.student_number && (
              <span className="text-xs text-muted-foreground">
                {r.student_number}
              </span>
            )}
            <StatusPill status={r.status} />
          </div>
          <p className="mt-1 text-sm text-foreground-soft">
            {r.internship_position} · {r.company_name}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" /> {r.course_name}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />{" "}
              {format(new Date(r.date_started), "MMMM-dd-yyyy")}{" "}
              {r?.date_ended
                ? `- ${format(new Date(r.date_ended), "MMMM-dd-yyyy")}`
                : ""}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />{" "}
              {r.accumulated_hours.toFixed(1)}/{r.total_hours} hrs
            </span>
          </div>
        </Link>

        <RecordListActions record={r} isPending={isPending} isSearching={isSearching} setConfirmation={setConfirmation} />
      </div>

      {r.status !== "pending" && r.status !== "rejected" && (
        <div className="mt-4">
          <ProgressBar
            value={Math.min(
              100,
              Math.round((r.accumulated_hours / r.total_hours) * 100),
            )}
            label="Internship hours completed"
          />
        </div>
      )}
    </article>
  );
}
