"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Eye, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format, isValid, parseISO } from "date-fns";
import ErrorUI from "@/components/ui/ErrorUI";
import EmployerSupervisionHistorySkeleton from "@/components/skeletons/EmployerSupervisionHistorySkeleton";
import { employerSupervisionHistoryOptions } from "@/lib/cache/employer-supervision-history-queries";

function displayDate(value) {
  const date = typeof value === "string" ? parseISO(value) : null;
  return date && isValid(date) ? format(date, "MMM d, yyyy") : "-";
}

export default function EmployerSupervisionHistory({ employerId, viewerId }) {
  const [page, setPage] = useState(1);
  const query = useQuery({ ...employerSupervisionHistoryOptions(viewerId, employerId, page), enabled: Boolean(viewerId && employerId) });
  if (!viewerId || !employerId) return null;
  if (query.isPending) return <EmployerSupervisionHistorySkeleton />;
  // Do not show cached history after the session/profile becomes unavailable.
  const data = [401, 403, 404].includes(query.error?.status) ? undefined : query.data;
  if (!query.isError && data?.pagination.total === 0) return null;
  const currentPage = data?.pagination.page ?? page;
  return <section aria-label="Supervised interns" className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h3 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Users className="size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />Supervised interns</h3><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Current and completed internships supervised by this employer.</p></div>
      {data && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-emphasis">{data.pagination.total} {data.pagination.total === 1 ? "student" : "students"}</span>}
    </div>
    {query.isError && <div className="mt-4"><ErrorUI compact error={query.error} reset={() => void query.refetch()} logError={false} /></div>}
    {data && <ul className="mt-4 space-y-3">{data.interns.map(intern => {
      const name = [intern.first_name, intern.last_name].filter(Boolean).join(" ").trim() || "Student";
      const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
      return <li key={intern.student_id} className="flex min-w-0 flex-col items-start justify-between gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 items-start gap-3">
          <div aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary-emphasis">{initials}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><p className="break-words text-sm font-semibold text-foreground">{name}</p></div>
            <p className="mt-1 break-words text-xs text-muted-foreground">{intern.course_name || "Course unavailable"}</p>
            <ul aria-label={`Internship positions of ${name}`} className="mt-3 space-y-3">{intern.placements.map(placement => <li key={placement.internship_id} className="border-l-2 border-primary/30 pl-3">
              <div className="flex flex-wrap items-center gap-2"><p className="break-words text-xs font-medium text-foreground">{placement.internship_position || "Intern"}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${placement.status === "ongoing" ? "bg-blue-500/10 text-blue-700 dark:text-blue-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>{placement.status === "ongoing" ? "Ongoing" : "Completed"}</span></div>
              {placement.company_name && <p className="mt-1 break-words text-xs text-muted-foreground">{placement.company_name}</p>}
              <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground"><CalendarDays className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" /><span>{displayDate(placement.date_started)} – {displayDate(placement.date_ended)}</span></p>
            </li>)}</ul>
          </div>
        </div>
        <Link href={`/users/${encodeURIComponent(intern.student_id)}`} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-primary-emphasis hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-ring"><Eye className="size-3.5" aria-hidden="true" />View profile<span className="sr-only"> of {name}</span></Link>
      </li>;
    })}</ul>}
    {(page > 1 || (data?.pagination.totalPages ?? 1) > 1) && <nav aria-label="Supervised intern history pages" className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
      <button type="button" disabled={query.isFetching || currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous supervised interns page" className="grid size-9 place-items-center rounded-md hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" aria-hidden="true" /></button>
      <span>Page {currentPage}{data ? ` / ${data.pagination.totalPages}` : ""}</span>
      <button type="button" disabled={query.isFetching || !data || currentPage >= data.pagination.totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Next supervised interns page" className="grid size-9 place-items-center rounded-md hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-4" aria-hidden="true" /></button>
    </nav>}
  </section>;
}
