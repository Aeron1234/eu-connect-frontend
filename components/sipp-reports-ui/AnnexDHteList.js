"use client";

import { notifyReadError } from "@/lib/client-read-error";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, FileText, TriangleAlert, Users } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { annexDHteInfiniteOptions, sippReportsKeys } from "@/lib/cache/sipp-reports-queries";

import ExportPdfButton from "../ui/ExportPdfButton";
import SearchBar from "../ui/SearchBar";
import HTEListSkeleton from "../skeletons/HTEListSkeleton";
import { canKeepLoadedPages, hasValidPage } from "@/lib/see-more-pagination.mjs";
import { formatGender } from "@/lib/formatGender";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function AnnexDHteList({
  availableAcadYear = [],
  initialPage,
}) {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialPage);
  const [year, setYear] = useState(initialPage?.academicYear || "");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ academicYear: initialPage?.academicYear || "", search: "" });

  useEffect(() => {
    const timeout = setTimeout(() => setFilters({ academicYear: year, search: query.trim() }), 500);
    return () => clearTimeout(timeout);
  }, [year, query]);

  const isChangingFilters = filters.academicYear !== year || filters.search !== query.trim();
  const companiesQuery = useInfiniteQuery({
    ...annexDHteInfiniteOptions(userId, filters),
    enabled: Boolean(userId),
    initialData:
      filters.academicYear === (initialPage?.academicYear || "") && !filters.search &&
      hasValidPage(initialPage, "companies")
        ? { pages: [initialPage], pageParams: [1] }
        : undefined,
  });
  const companies = useMemo(() => {
    const seen = new Set();
    return (companiesQuery.data?.pages || []).flatMap((page) =>
      page.companies.filter((company) => {
        if (seen.has(company.company_key)) return false;
        seen.add(company.company_key);
        return true;
      }),
    );
  }, [companiesQuery.data]);
  const total = companiesQuery.data?.pages[0]?.pagination.total || 0;
  const isPending = isChangingFilters || companiesQuery.isPending;

  function showCachedFilters(nextFilters) {
    if (userId && queryClient.getQueryData(sippReportsKeys.annexDList(userId, nextFilters))?.pages?.length) {
      setFilters(nextFilters);
    }
  }

  useEffect(() => {
    if (companiesQuery.error) notifyReadError("Error loading HTE companies:", companiesQuery.error);
  }, [companiesQuery.error]);

  useEffect(() => {
    if (!initialPage || serverSnapshotRef.current === initialPage || !userId) return;
    serverSnapshotRef.current = initialPage;
    const seedFilters = { academicYear: initialPage.academicYear || "", search: "" };
    queryClient.setQueryData(sippReportsKeys.annexDList(userId, seedFilters), (old) => {
      if (!old?.pages?.length) return { pages: [initialPage], pageParams: [1] };
      const previous = old.pages[0];
      const keepLoaded = canKeepLoadedPages(
        previous.companies.map((company) => company.company_key),
        previous.pagination.total,
        initialPage.companies,
        initialPage.pagination.total,
        (company) => company.company_key,
      );
      return {
        pages: keepLoaded ? [initialPage, ...old.pages.slice(1)] : [initialPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialPage, queryClient, userId]);

  function handleSeeMore() {
    if (!isPending && !companiesQuery.isFetching && companiesQuery.hasNextPage) {
      void companiesQuery.fetchNextPage();
    }
  }

  const totalInterns = companies.reduce((n, c) => n + (c.intern_count || 0), 0);

  return (
    <div>
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={(e) => {
              const search = e.target.value;
              setQuery(search);
              showCachedFilters({ academicYear: year, search: search.trim() });
            }}
            placeholder="Search company or student name..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["All", ...availableAcadYear].map((ay) => (
            <button
              key={ay}
              type="button"
              onClick={() => {
                const academicYear = ay === "All" ? "" : ay;
                setYear(academicYear);
                showCachedFilters({ academicYear, search: query.trim() });
              }}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                (ay === "All" && !year) || year === ay
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-primary-emphasis",
              )}
            >
              {ay}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-3">
        <StatCard
          icon={<Building2 className="size-5 opacity-80" />}
          value={String(total)}
          label="Partner HTEs"
          highlight
        />
        <StatCard
          icon={<Users className="size-5 text-foreground-subtle" />}
          value={String(totalInterns)}
          label="Total Interns (loaded)"
        />
        <StatCard
          icon={<FileText className="size-5 text-foreground-subtle" />}
          value={year || "All"}
          label="Academic Year"
        />
      </div>

      {!isChangingFilters && companiesQuery.error && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <span className="flex items-center gap-2 text-foreground-soft"><TriangleAlert className="size-4 text-destructive" />{companiesQuery.error.message}</span>
          <button type="button" onClick={() => companiesQuery.isFetchNextPageError ? companiesQuery.fetchNextPage() : companiesQuery.refetch()} className="font-semibold text-primary-emphasis hover:underline">Try again</button>
        </div>
      )}

      {isPending ? (
        <HTEListSkeleton />
      ) : companiesQuery.error && companies.length === 0 ? null
      : companies.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <FileText className="size-8 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">No placements found</p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different academic year or clear the search filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4 sm:space-y-5">
          {companies.map((c) => (
            <section
              key={c.company_key}
              className="@container overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 border-b border-border px-4 py-4 sm:px-5 @2xl:grid-cols-[auto_minmax(0,1fr)_auto]">
                <span className="col-start-1 row-start-1 grid size-9 place-items-center rounded-lg bg-primary-50 text-xs font-semibold text-primary-emphasis">
                  {c.company_name.slice(0, 2).toUpperCase()}
                </span>
                <div className="col-span-2 row-start-2 min-w-0 @2xl:col-span-1 @2xl:col-start-2 @2xl:row-start-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {c.company_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.company_address}
                  </p>
                </div>
                <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-self-end gap-2 @2xl:col-start-3">
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-emphasis">
                    {c.intern_count}{" "}
                    {c.intern_count === 1 ? "intern" : "interns"}
                  </span>
                  <ExportPdfButton
                    endpoint="/api/reports/annex-d"
                    params={{
                      companyKey: c.company_key,
                      academicYear: c.academic_year,
                    }}
                  />
                </div>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                      <th className="w-12 px-4 sm:px-5 py-3 font-medium">#</th>
                      <th className="px-4 sm:px-5 py-3 font-medium">
                        Name of Student Intern
                      </th>
                      <th className="px-4 sm:px-5 py-3 font-medium">Program</th>
                      <th className="px-4 sm:px-5 py-3 font-medium">Gender</th>
                      <th className="px-4 sm:px-5 py-3 font-medium">
                        Duration of Internship
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.interns.map((intern, i) => (
                      <tr
                        key={`${c.company_key}-${i}`}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 sm:px-5 py-3 text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-4 sm:px-5 py-3 font-medium text-foreground">
                          {intern.name}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                          {intern.course}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                          {formatGender(intern.gender)}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                          {intern.date_started?.slice(0, 10)} –{" "}
                          {intern.date_ended?.slice(0, 10) || "Present"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {!isPending && companiesQuery.hasNextPage && (
        <div className="mt-5 text-center">
          <button
            onClick={handleSeeMore}
            disabled={companiesQuery.isFetchingNextPage}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition-colors"
          >
            {companiesQuery.isFetchingNextPage ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, highlight }) {
  return (
    <div
      className={cx(
        "flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-5 py-4 sm:py-5 shadow-sm",
        highlight
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground",
      )}
    >
      {icon}
      <div>
        <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>
        <p
          className={cx(
            "mt-1.5 text-xs",
            highlight ? "opacity-80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
