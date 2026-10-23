"use client";

import { notifyReadError } from "@/lib/client-read-error";
import ErrorUI from "@/components/ui/ErrorUI";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesOptions } from "@/lib/cache/reference-queries";
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
import DropdownFilter from "../ui/DropdownFilter";
import AlumniCompaniesSkeleton from "../skeletons/AlumniCompaniesSkeleton";

function keyOf(company) {
  return company.company_name.trim().toLowerCase();
}

function PastInternshipsPageContent({
  initialData,
  academicYears: initialAcademicYears,
  courses: initialCourses,
  departments: initialDepartments,
  yearFilter: initialYearFilter = "all",
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  } = {},
}) {
  const { user } = useUser();
  const coursesQuery = useQuery({ ...coursesOptions(user.id), enabled: Boolean(user.id) });
  const courses = coursesQuery.data || initialCourses || [];
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(initialYearFilter);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [filters, setFilters] = useState({ academicYear: initialYearFilter, search: "", departmentId: "all" });
  const serverSnapshotRef = useRef({
    initialData,
    initialAcademicYears,
    initialDepartments,
    initialPage,
    initialTotal,
    initialTotalPages,
    initialYearFilter,
  });

  useEffect(() => {
    const search = query.trim();
    if (filters.academicYear === yearFilter && filters.search === search && filters.departmentId === departmentFilter) return;
    const timeout = setTimeout(() => setFilters({ academicYear: yearFilter, search, departmentId: departmentFilter }), 500);
    return () => clearTimeout(timeout);
  }, [yearFilter, departmentFilter, query, filters.academicYear, filters.search, filters.departmentId]);

  const pastInternshipsQuery = useInfiniteQuery({
    ...pastInternshipsInfiniteOptions(user.id, filters),
    initialData:
      Array.isArray(initialData) && filters.academicYear === initialYearFilter && filters.search === "" && filters.departmentId === "all"
        ? {
            pages: [{
              data: initialData,
              academicYears: initialAcademicYears,
              departments: initialDepartments,
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
  const academicYears = pastInternshipsQuery.data?.pages[0]?.academicYears ?? initialAcademicYears ?? [];
  const departments = pastInternshipsQuery.data?.pages[0]?.departments ?? initialDepartments ?? [];
  const isLoadingMore = pastInternshipsQuery.isFetchingNextPage;
  const isSearching =
    filters.academicYear !== yearFilter ||
    filters.departmentId !== departmentFilter ||
    filters.search !== query.trim() ||
    pastInternshipsQuery.isPending ||
    pastInternshipsQuery.isPlaceholderData;

  function showCachedFilters(nextFilters) {
    if (user?.id && queryClient.getQueryData(pastInternshipsKeys.list(user.id, nextFilters))?.pages?.length) {
      setFilters(nextFilters);
    }
  }

  function handleSearchChange(event) {
    const search = event.target.value;
    setQuery(search);
    showCachedFilters({ academicYear: yearFilter, search: search.trim(), departmentId: departmentFilter });
  }

  function handleYearChange(academicYear) {
    setYearFilter(academicYear);
    showCachedFilters({ academicYear, search: query.trim(), departmentId: departmentFilter });
  }

  function handleDepartmentChange(departmentId) {
    setDepartmentFilter(departmentId);
    showCachedFilters({ academicYear: yearFilter, search: query.trim(), departmentId });
  }

  useEffect(() => {
    if (pastInternshipsQuery.error && pastInternshipsQuery.data) {
      notifyReadError("Error loading past internships:", pastInternshipsQuery.error);
    }
  }, [pastInternshipsQuery.error, pastInternshipsQuery.data]);

  useEffect(() => {
    const previous = serverSnapshotRef.current;
    if (!Array.isArray(initialData)) return;
    if (
      previous.initialData === initialData &&
      previous.initialAcademicYears === initialAcademicYears &&
      previous.initialDepartments === initialDepartments &&
      previous.initialPage === initialPage &&
      previous.initialTotal === initialTotal &&
      previous.initialTotalPages === initialTotalPages &&
      previous.initialYearFilter === initialYearFilter
    ) return;
    serverSnapshotRef.current = {
      initialData,
      initialAcademicYears,
      initialDepartments,
      initialPage,
      initialTotal,
      initialTotalPages,
      initialYearFilter,
    };
    const seedFilters = { academicYear: initialYearFilter, search: "", departmentId: "all" };
    queryClient.setQueryData(pastInternshipsKeys.list(user.id, seedFilters), (old) => {
      if (!old?.pages?.length) return {
        pages: [{
          data: initialData,
          academicYears: initialAcademicYears,
          departments: initialDepartments,
          pagination: { page: initialPage, total: initialTotal, totalPages: initialTotalPages },
        }],
        pageParams: [1],
      };
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
        departments: initialDepartments,
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
  }, [initialData, initialAcademicYears, initialDepartments, initialPage, initialTotal, initialTotalPages, initialYearFilter, queryClient, user.id]);

  function refreshAfterRecordChange() {
    // A mutation can move or remove companies, which changes every later offset page.
    queryClient.setQueriesData({ queryKey: pastInternshipsKeys.all(user.id) }, (old) =>
      old?.pages?.length ? { pages: [old.pages[0]], pageParams: [1] } : old,
    );
    void queryClient.invalidateQueries({ queryKey: pastInternshipsKeys.all(user.id) });
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={handleSearchChange}
            placeholder="Search company or alumni..."
          />
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-[10rem_10rem]">
        <AcademicYearFilter
          academicYears={academicYears}
          value={yearFilter}
          onChange={handleYearChange}
          className="h-10 w-full min-w-0 rounded-md bg-card px-3 text-sm"
        />
        <DropdownFilter
          value={departmentFilter}
          onValueChange={handleDepartmentChange}
          placeholder="Department"
          options={[
            { value: "all", label: "Departments" },
            ...departments.map((department) => ({
              value: String(department.id),
              label: department.code || department.name,
            })),
          ]}
          className="h-10 w-full min-w-0 rounded-md bg-card px-3 text-sm"
          itemClassName="whitespace-normal break-words text-sm"
        />
        </div>
      </div>

      {coursesQuery.isError && (
        <ErrorUI error={coursesQuery.error} reset={() => void coursesQuery.refetch()} compact logError={false} />
      )}
      {!isSearching && pastInternshipsQuery.isError && pastInternshipsQuery.data && (
        <ErrorUI error={pastInternshipsQuery.error} compact logError={false} reset={() => {
          if (pastInternshipsQuery.isFetchNextPageError) void pastInternshipsQuery.fetchNextPage();
          else void pastInternshipsQuery.refetch();
        }} />
      )}

      {isSearching ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AlumniCompaniesSkeleton key={index} />
          ))}
        </div>
      ) : pastInternshipsQuery.isError && !pastInternshipsQuery.data ? (
        <ErrorUI error={pastInternshipsQuery.error} reset={() => void pastInternshipsQuery.refetch()} logError={false} />
      ) : companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <Building2 className="size-8 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">No companies found</p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different department or academic year, or clear the search.
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
