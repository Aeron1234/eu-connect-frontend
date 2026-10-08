"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, ChevronLeft, ChevronRight, Loader2, MapPin } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { dashboardListsKeys, employerJobsPageOptions } from "@/lib/cache/dashboard-lists-queries";

// internship_postings.work_type -> display label
const workTypeMap = {
  "on-site": "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

// internship_postings.work_type -> pill badge style
const workTypeBadgeStyles = {
  "on-site": "text-blue-600 bg-blue-50 border border-blue-200",
  hybrid: "text-purple-600 bg-purple-50 border border-purple-200",
  remote: "text-emerald-600 bg-emerald-50 border border-emerald-200",
};

export function mapJobRow(row) {
  return {
    id: row.id,
    position: row.position,
    location: row.location,
    type: workTypeMap[row.work_type] || row.work_type,
    typeKey: row.work_type,
    vacancies: row.vacancies,
    postedDate: row.created_at,
  };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function JobsPostedTable({ initialPage }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialPage);
  const [page, setPage] = useState(1);
  const jobsQuery = useQuery({
    ...employerJobsPageOptions(user?.id, page),
    enabled: Boolean(user?.id),
    initialData: page === 1 && initialPage ? initialPage : undefined,
  });

  useEffect(() => {
    if (!user?.id || !initialPage || serverSnapshotRef.current === initialPage) return;
    serverSnapshotRef.current = initialPage;
    queryClient.setQueryData(dashboardListsKeys.employerJobs(user.id, 1), initialPage);
  }, [initialPage, queryClient, user?.id]);

  const jobs = (jobsQuery.data?.jobs || []).map(mapJobRow);
  const totalPages = jobsQuery.data?.totalPages ?? initialPage?.totalPages ?? 1;
  const isLoading = jobsQuery.isPending;
  const hasError = jobsQuery.isError && !jobsQuery.data;

  return (
    <section className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
        <Briefcase className="w-4 h-4 text-primary-emphasis" />
        Jobs You Posted
      </h3>
      <div className="overflow-x-auto" aria-busy={isLoading}>
        <table className="w-2xl md:w-full text-sm">
          <thead>
            <tr className="border-b border-border text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="text-left py-2 font-medium">Position</th>
              <th className="text-left py-2 font-medium">Location</th>
              <th className="text-left py-2 font-medium">Type</th>
              <th className="text-right py-2 font-medium">Vacancies</th>
              <th className="text-right py-2 font-medium">Posted</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2" role="status">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Loading posted jobs...
                  </span>
                </td>
              </tr>
            ) : hasError ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-foreground">
                  <p>{jobsQuery.error?.message || "Could not load posted jobs."}</p>
                  <button type="button" onClick={() => void jobsQuery.refetch()} className="mt-2 font-semibold text-primary-emphasis hover:underline">
                    Try again
                  </button>
                </td>
              </tr>
            ) : jobs.map((job) => (
              <tr
                key={job.id}
                className="border-b border-border last:border-b-0"
              >
                <td className="py-3 text-foreground font-medium">
                  {job.position}
                </td>
                <td className="py-3">
                  <span className="flex items-center gap-1 text-foreground-soft">
                    <MapPin className="w-3.5 h-3.5 text-primary-emphasis" />
                    {job.location}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      workTypeBadgeStyles[job.typeKey] ||
                      "text-foreground-soft bg-muted border border-border"
                    }`}
                  >
                    {job.type}
                  </span>
                </td>
                <td
                  className={`py-3 text-right font-medium ${
                    job.vacancies === 0 ? "text-blue-600" : "text-foreground"
                  }`}
                >
                  {job.vacancies}
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  {formatDate(job.postedDate)}
                </td>
              </tr>
            ))}
            {!isLoading && !hasError && jobs.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-sm text-foreground-soft"
                >
                  No jobs posted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(totalPages > 1 || page > 1) && (
        <div className="mt-6 flex items-center justify-end gap-4 text-sm font-semibold text-muted-foreground">
          <button
            type="button"
            aria-label="Previous jobs page"
            onClick={() => setPage((current) => current - 1)}
            disabled={isLoading || hasError || page <= 1}
            className="rounded-full p-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span>Page {page} / {Math.max(1, totalPages)}</span>
          <button
            type="button"
            aria-label="Next jobs page"
            onClick={() => setPage((current) => current + 1)}
            disabled={isLoading || hasError || page >= totalPages}
            className="rounded-full p-1 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

export default JobsPostedTable;
