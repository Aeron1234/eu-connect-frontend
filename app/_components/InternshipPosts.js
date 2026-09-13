"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Search } from "lucide-react";
import InternshipPostsList from "./InternshipPostsList";
import { getInternshipPosts } from "../_services/services";
import { useUser } from "@/contexts/UserContext";

const scopeTabs = [
  { label: "All Companies", value: "" },
  { label: "My Posts", value: "myposts" },
];

const workTypeTabs = [
  { label: "All", workType: "" },
  { label: "On-site", workType: "on-site" },
  { label: "Hybrid", workType: "hybrid" },
  { label: "Remote", workType: "remote" },
];

function buildHref({ scope, workType, courseId }) {
  const params = new URLSearchParams();
  if (scope) params.set("scope", scope);
  if (workType) params.set("workType", workType);
  if (courseId) params.set("courseId", courseId);
  const qs = params.toString();
  return `/internships${qs ? `?${qs}` : ""}`;
}

function keyOf(post) {
  return post.id;
}

function InternshipPosts({
  internshipPosts: initialData = [],
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  },
  courses = [],
  workType = "",
  courseId = "",
  scope = "",
}) {
  const [internshipPosts, setInternshipPosts] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const { user } = useUser();
  const userId = user.id;
  const userRole = user.role;

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);
  const prevPage1KeysRef = useRef(new Set((initialData || []).map(keyOf)));

  useEffect(() => {
    const freshMap = new Map((initialData || []).map((p) => [keyOf(p), p]));
    const prevPage1Keys = prevPage1KeysRef.current;

    setInternshipPosts((prev) => {
      if (prev.length === 0) return initialData;

      const updatedList = prev
        .map((p) => freshMap.get(keyOf(p)) || p)
        .filter((p) => {
          const wasOnPage1Before = prevPage1Keys.has(keyOf(p));
          const isStillFresh = freshMap.has(keyOf(p));
          return !wasOnPage1Before || isStillFresh;
        });

      const existingKeys = new Set(updatedList.map(keyOf));
      const brandNew = (initialData || []).filter(
        (p) => !existingKeys.has(keyOf(p)),
      );

      return [...brandNew, ...updatedList];
    });

    setCurrentPage(initialPage);
    setTotalPages(initialTotalPages || 1);
    setTotal(initialTotal || 0);

    prevPage1KeysRef.current = new Set((initialData || []).map(keyOf));
  }, [initialData, initialPage, initialTotalPages, initialTotal]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const newData = await getInternshipPosts({
          workType,
          courseId: courseId ?? "",
          search: query,
          mine: scope === "myposts" ? "true" : "",
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error(
            "Error loading filtered internship posts:",
            newData.error,
          );
          setInternshipPosts([]);
          setTotalPages(1);
          setTotal(0);
          setCurrentPage(1);
          return;
        }

        setInternshipPosts(newData?.data || []);
        setCurrentPage(1);
        setTotalPages(newData?.pagination?.totalPages || 1);
        setTotal(newData?.pagination?.total || 0);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading filtered internship posts:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, workType, courseId, scope]);

  async function handleSeeMore() {
    if (isPending || currentPage >= totalPages) return;
    setIsPending(true);
    const nextPage = currentPage + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getInternshipPosts({
        workType,
        courseId: courseId ?? "",
        search: query,
        mine: scope === "myposts" ? "true" : "",
        page: nextPage,
      });

      if (thisRequestId !== requestIdRef.current) return;

      if (newData?.error) {
        console.error("Error loading more internship posts:", newData.error);
        return;
      }

      const incoming = newData?.data || [];

      setInternshipPosts((prev) => {
        const existingIds = new Set(prev.map(keyOf));
        const filteredNew = incoming.filter((p) => !existingIds.has(keyOf(p)));
        return [...prev, ...filteredNew];
      });

      setCurrentPage(nextPage);
      if (newData?.pagination?.totalPages) {
        setTotalPages(newData.pagination.totalPages);
      }
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more internship posts:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  const handleItemUpdate = (updatedItem) => {
    setInternshipPosts((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
      ),
    );
  };

  const handleItemDelete = (deletedId) => {
    setInternshipPosts((prev) => prev.filter((item) => item.id !== deletedId));
  };

  return (
    <>
      {/* Filters */}

      {userRole === "employer" && (
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-stone-200 p-1 w-fit">
            {scopeTabs.map((s) => (
              <Link
                key={s.value}
                href={buildHref({ scope: s.value, workType, courseId })}
                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  scope === s.value
                    ? "bg-primary-500 text-primary-foreground"
                    : "bg-stone-200 text-muted-foreground hover:text-primary-500"
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {courses.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buildHref({ scope, workType, courseId: null })}
            className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
              !courseId
                ? "bg-primary-500 text-primary-foreground"
                : "bg-stone-200 text-muted-foreground hover:text-primary-500"
            }`}
          >
            All
          </Link>
          {courses.map((c) => (
            <Link
              key={c.id}
              href={buildHref({ scope, workType, courseId: c.id })}
              className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                String(courseId) === String(c.id)
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-stone-200 text-muted-foreground hover:text-primary-500"
              }`}
            >
              {c.short_name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          {workTypeTabs.map((wt) => (
            <Link
              key={wt.label}
              href={buildHref({ scope, workType: wt.workType, courseId })}
              className={`rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                workType === wt.workType
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-stone-200 text-muted-foreground hover:text-primary-500"
              }`}
            >
              {wt.label}
            </Link>
          ))}
        </div>

        <div className="relative sm:max-w-md sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or position..."
            aria-label="Search company or position"
            className="w-full rounded-lg border border-stone-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {total ? total : null} listings
      </p>

      {/* Listings */}
      <div className="space-y-4 sm:space-y-6">
        {internshipPosts.map((item) => {
          const isFavorited = favoriteIds.has(item.id);
          return (
            <InternshipPostsList
              key={item.id}
              item={item}
              isFavorited={isFavorited}
              setFavoriteIds={setFavoriteIds}
              userRole={userRole}
              userId={userId}
              courses={courses}
              onUpdate={handleItemUpdate}
              onDelete={() => handleItemDelete(item.id)}
            />
          );
        })}

        {internshipPosts.length === 0 && !isPending && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 sm:py-20 text-center">
            <BriefcaseBusiness className="size-8 text-stone-300" />
            <p className="text-sm text-stone-500">
              No internship listings found.
            </p>
          </div>
        )}
      </div>

      {currentPage < totalPages && (
        <div className="w-full">
          <button
            onClick={handleSeeMore}
            disabled={isPending}
            className="w-full text-center text-sm sm:text-lg font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </>
  );
}

export default InternshipPosts;
