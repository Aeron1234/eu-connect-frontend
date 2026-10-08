"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import {
  pastInternshipsInfiniteOptions,
  pastInternshipsKeys,
} from "@/lib/cache/past-internships-queries";
import SearchBar from "../ui/SearchBar";
import AlumniCompanies from "./AlumniCompanies";
import AcademicYearFilter from "../ui/AcademicYearFilter";
import AlumniCompaniesSkeleton from "../skeletons/AlumniCompaniesSkeleton";

function keyOf(company) {
  return company.company_name.trim().toLowerCase();
}

function PastInternshipsPageContent({
  initialData = [],
  academicYears: initialAcademicYears = [],
  courses = [],
  yearFilter: initialYearFilter = "all",
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  },
}) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(initialYearFilter);
  const [filters, setFilters] = useState({ academicYear: initialYearFilter, search: "" });
  const serverSnapshotRef = useRef({
    initialData,
    initialAcademicYears,
    initialPage,
    initialTotal,
    initialTotalPages,
    initialYearFilter,
  });

  useEffect(() => {
    const timeout = setTimeout(
      () => setFilters({ academicYear: yearFilter, search: query }),
      500,
    );
    return () => clearTimeout(timeout);
  }, [yearFilter, query]);

  const pastInternshipsQuery = useInfiniteQuery({
    ...pastInternshipsInfiniteOptions(user.id, filters),
    initialData:
      filters.academicYear === initialYearFilter && filters.search === ""
        ? {
            pages: [{
              data: initialData,
              academicYears: initialAcademicYears,
              pagination: {
                page: initialPage,
                total: initialTotal,
                totalPages: initialTotalPages,
              },
            }],
            pageParams: [1],
          }
        : undefined,
  });

  const companies = useMemo(() => {
    const seen = new Set();
    return (pastInternshipsQuery.data?.pages ?? []).flatMap((page) =>
      page.data.filter((company) => {
        const key = keyOf(company);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }),
    );
  }, [pastInternshipsQuery.data]);
  const academicYears = pastInternshipsQuery.data?.pages[0]?.academicYears ?? initialAcademicYears;
  const isLoadingMore = pastInternshipsQuery.isFetchingNextPage;
  const isSearching =
    filters.academicYear !== yearFilter ||
    filters.search !== query ||
    pastInternshipsQuery.isPending;

  useEffect(() => {
    if (pastInternshipsQuery.error) {
      notifyReadError("Error loading past internships:", pastInternshipsQuery.error);
    }
  }, [pastInternshipsQuery.error]);

  useEffect(() => {
    const previous = serverSnapshotRef.current;
    if (
      previous.initialData === initialData &&
      previous.initialAcademicYears === initialAcademicYears &&
      previous.initialPage === initialPage &&
      previous.initialTotal === initialTotal &&
      previous.initialTotalPages === initialTotalPages &&
      previous.initialYearFilter === initialYearFilter
    ) return;
    serverSnapshotRef.current = {
      initialData,
      initialAcademicYears,
      initialPage,
      initialTotal,
      initialTotalPages,
      initialYearFilter,
    };
    const seedFilters = { academicYear: initialYearFilter, search: "" };
    queryClient.setQueryData(pastInternshipsKeys.list(user.id, seedFilters), (old) => {
      if (!old?.pages?.length) return old;
      const previousFirstPage = old.pages[0];
      const keepLoaded = canKeepLoadedPages(
        previousFirstPage.data.map(keyOf),
        previousFirstPage.pagination.total,
        initialData,
        initialTotal,
        keyOf,
      );
      const firstPage = {
        data: initialData,
        academicYears: initialAcademicYears,
        pagination: {
          page: initialPage,
          total: initialTotal,
          totalPages: initialTotalPages,
        },
      };
      return {
        pages: keepLoaded ? [firstPage, ...old.pages.slice(1)] : [firstPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialData, initialAcademicYears, initialPage, initialTotal, initialTotalPages, initialYearFilter, queryClient, user.id]);

  function refreshAfterRecordChange() {
    // A mutation can move or remove companies, which changes every later offset page.
    queryClient.setQueriesData({ queryKey: pastInternshipsKeys.all(user.id) }, (old) =>
      old?.pages?.length ? { pages: [old.pages[0]], pageParams: [1] } : old,
    );
    void queryClient.invalidateQueries({ queryKey: pastInternshipsKeys.all(user.id) });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or alumni..."
          />
        </div>
        <AcademicYearFilter
          academicYears={academicYears}
          value={yearFilter}
          onChange={setYearFilter}
        />
      </div>

      {isSearching ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AlumniCompaniesSkeleton key={index} />
          ))}
        </div>
      ) : pastInternshipsQuery.isError && !pastInternshipsQuery.data ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">Could not load past internships.</p>
          <button type="button" onClick={() => void pastInternshipsQuery.refetch()} className="mt-3 text-sm font-semibold text-primary-emphasis">
            Try again
          </button>
        </div>
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <Building2 className="size-8 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">No companies found</p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different batch filter or clear the search.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {companies.map((company) => (
              <AlumniCompanies
                company={company}
                key={keyOf(company)}
                handleItemDelete={refreshAfterRecordChange}
                handleItemUpdate={refreshAfterRecordChange}
                courses={courses}
              />
            ))}
          </div>
          {pastInternshipsQuery.hasNextPage && (
            <button
              type="button"
              onClick={() => void pastInternshipsQuery.fetchNextPage()}
              disabled={isLoadingMore}
              className="w-full text-center text-sm sm:text-base font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
            >
              {isLoadingMore ? "Loading..." : "See more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default PastInternshipsPageContent;
