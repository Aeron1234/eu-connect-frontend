"use client";

import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import SearchBar from "../ui/SearchBar";
import AlumniCompanies from "./AlumniCompanies";
import AcademicYearFilter from "../ui/AcademicYearFilter";
import { getAlumniInternships } from "@/lib/server-actions/past-internships-actions";
import AlumniCompaniesSkeleton from "../skeletons/AlumniCompaniesSkeleton";
import {
  canKeepLoadedPages,
  hasValidPage,
  pageAfterRefresh,
  reconcilePageOne,
} from "@/lib/see-more-pagination.mjs";

function keyOf(company) {
  return company.company_name.trim().toLowerCase();
}

function PastInternshipsPageContent({
  initialData = [],
  academicYears = [],
  courses = [],
  yearFilter: initialYearFilter = "all",
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  },
}) {
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState(initialYearFilter);
  const [companies, setCompanies] = useState(initialData || []);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
  const [isPending, setIsPending] = useState(false);

  const prevPage1KeysRef = useRef(initialData.map(keyOf));
  const prevTotalRef = useRef(initialTotal);
  const lastServerSnapshotRef = useRef({
    data: initialData,
    page: initialPage,
    total: initialTotal,
    totalPages: initialTotalPages,
  });
  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const previous = lastServerSnapshotRef.current;
    if (
      previous.data === initialData &&
      previous.page === initialPage &&
      previous.total === initialTotal &&
      previous.totalPages === initialTotalPages
    )
      return;
    lastServerSnapshotRef.current = {
      data: initialData,
      page: initialPage,
      total: initialTotal,
      totalPages: initialTotalPages,
    };
    const keepLoadedPages = canKeepLoadedPages(
      prevPage1KeysRef.current,
      prevTotalRef.current,
      initialData,
      initialTotal,
      keyOf,
    );
    prevPage1KeysRef.current = initialData.map(keyOf);
    prevTotalRef.current = initialTotal;

    // Server props are for the initial filter only; a client-side search owns its list.
    if (query || yearFilter !== initialYearFilter) return;
    if (!keepLoadedPages) {
      requestIdRef.current += 1;
      setIsPending(false);
    }
    setCompanies((prev) =>
      reconcilePageOne(prev, initialData, keepLoadedPages, keyOf),
    );
    setPage((current) => pageAfterRefresh(current, keepLoadedPages));
    setTotalPages(initialTotalPages || 1);
  }, [
    initialData,
    initialPage,
    initialTotal,
    initialTotalPages,
    query,
    yearFilter,
    initialYearFilter,
  ]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setIsPending(true);

    const timeout = setTimeout(async () => {
      try {
        const newData = await getAlumniInternships({
          academicYear: yearFilter,
          search: query,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (!hasValidPage(newData, "data")) {
          console.error(
            "Error searching past internships:",
            newData?.error || "Invalid response from the server",
          );
          return;
        }

        setCompanies(newData.data);
        setPage(1);
        setTotalPages(newData?.pagination?.totalPages || 1);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error searching past internships:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, yearFilter]);

  async function refreshAfterRecordChange() {
    // Editing an alumni record can move it to a different company or year;
    // deleting one can remove a company entirely. Both shift offset pages.
    const thisRequestId = ++requestIdRef.current;
    setIsPending(true);
    try {
      const fresh = await getAlumniInternships({
        academicYear: yearFilter,
        search: query,
        page: 1,
      });
      if (thisRequestId !== requestIdRef.current) return;
      if (!hasValidPage(fresh, "data")) {
        console.error(
          "Error refreshing past internships:",
          fresh?.error || "Invalid response from the server",
        );
        return;
      }
      setCompanies(fresh.data);
      setPage(1);
      setTotalPages(fresh.pagination.totalPages || 1);
    } catch (error) {
      if (thisRequestId === requestIdRef.current)
        console.error("Error refreshing past internships:", error);
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getAlumniInternships({
        page: nextPage,
        academicYear: yearFilter,
        search: query,
      });
      if (thisRequestId !== requestIdRef.current) return;
      if (!hasValidPage(newData, "data", "pagination", nextPage)) {
        console.error(
          "Error loading more past internships:",
          newData?.error || "Invalid response from the server",
        );
        return;
      }
      const incoming = newData.data;

      setCompanies((prev) => {
        const existingKeys = new Set(prev.map(keyOf));
        const filteredNew = incoming.filter((c) => !existingKeys.has(keyOf(c)));
        return [...prev, ...filteredNew];
      });

      setPage(nextPage);
      if (newData?.pagination?.totalPages) {
        setTotalPages(newData.pagination.totalPages);
      }
    } catch (error) {
      if (thisRequestId === requestIdRef.current)
        console.error("Error loading more past internships:", error);
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
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

      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <Building2 className="size-8 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">No companies found</p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different batch filter or clear the search.
          </p>
        </div>
      ) : (
        <>
          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <AlumniCompaniesSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {companies.map((c) => (
                <AlumniCompanies
                  company={c}
                  key={keyOf(c)}
                  handleItemDelete={refreshAfterRecordChange}
                  handleItemUpdate={refreshAfterRecordChange}
                  courses={courses}
                />
              ))}
            </div>
          )}

          {page < totalPages && (
            <button
              onClick={handleSeeMore}
              disabled={isPending}
              className="w-full text-center text-sm sm:text-base font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
            >
              {isPending ? "Loading..." : "See more"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default PastInternshipsPageContent;
