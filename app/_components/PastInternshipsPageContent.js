"use client";

import { useEffect, useRef, useState } from "react";
import { Building2 } from "lucide-react";
import SearchBar from "./SearchBar";
import Link from "next/link";
import AlumniCompanies from "./AlumniCompanies";
import { cx } from "@/lib/utils";
import { getAlumniInternships } from "../_services/dept-head-actions";

function keyOf(company) {
  return company.company_name.trim().toLowerCase();
}

function PastInternshipsPageContent({
  initialData = [],
  academicYears = [],
  courses = [],
  yearFilter = "all",
  pagination: {
    page: initialPage = 1,
    total = 0,
    totalPages: initialTotalPages = 1,
  },
}) {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState(initialData || []);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
  const [isPending, setIsPending] = useState(false);

  const prevPage1KeysRef = useRef(new Set((initialData || []).map(keyOf)));
  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const freshMap = new Map((initialData || []).map((c) => [keyOf(c), c]));
    const prevPage1Keys = prevPage1KeysRef.current;

    setCompanies((prev) => {
      if (prev.length === 0) return initialData;

      const updatedList = prev
        .map((c) => freshMap.get(keyOf(c)) || c)
        .filter((c) => {
          const wasOnPage1Before = prevPage1Keys.has(keyOf(c));
          const isStillFresh = freshMap.has(keyOf(c));
          return !wasOnPage1Before || isStillFresh;
        });

      const existingKeys = new Set(updatedList.map(keyOf));
      const brandNew = (initialData || []).filter(
        (c) => !existingKeys.has(keyOf(c)),
      );

      return [...brandNew, ...updatedList];
    });

    setPage(initialPage);
    setTotalPages(initialTotalPages || 1);

    prevPage1KeysRef.current = new Set((initialData || []).map(keyOf));
  }, [initialData, initialPage, initialTotalPages]);

  // Debounced search — the missing piece. Fires whenever `query` changes,
  // fetches page 1 with the search term, and ignores stale responses if
  // the user keeps typing before an earlier request resolves.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const newData = await getAlumniInternships({
          academicYear: yearFilter,
          search: query,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return; // stale, ignore

        if (newData?.error) {
          console.error("Error searching past internships:", newData.error);
          setCompanies([]);
          setTotalPages(1);
          setPage(1);
          return;
        }

        setCompanies(newData?.data || []);
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

  const handleItemUpdate = (updatedItem) => {
    setCompanies((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
      ),
    );
  };

  const handleItemDelete = (deletedId) => {
    setCompanies((prev) => prev.filter((item) => item.id !== deletedId));
  };

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;

    try {
      const newData = await getAlumniInternships({
        page: nextPage,
        academicYear: yearFilter,
        search: query,
      });
      const incoming = newData?.data || [];

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
      console.error("Error loading more past internships:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...academicYears].map((year) => (
            <Link
              key={year}
              href={`/past-internships?filter=${year == "All" ? year.toLowerCase() : year}`}
              className={cx(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                yearFilter === year.toLowerCase()
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {year}
            </Link>
          ))}
        </div>

        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or alumni..."
        />
      </div>

      {companies.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-24 text-center ">
          <Building2 className="size-8 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            No companies found
          </p>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground/70">
            Try a different batch filter or clear the search.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {companies.map((c) => (
              <AlumniCompanies
                company={c}
                key={keyOf(c)}
                handleItemDelete={handleItemDelete}
                handleItemUpdate={handleItemUpdate}
                courses={courses}
              />
            ))}
          </div>

          {page < totalPages && (
            <button
              onClick={handleSeeMore}
              disabled={isPending}
              className="w-full text-center text-lg font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
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
