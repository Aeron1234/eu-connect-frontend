"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InternshipPostsList from "./InternshipPostsList";
import { getInternshipPosts } from "../_services/services";
import { useUser } from "@/contexts/UserContext";
import SearchBar from "./SearchBar";
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

function InternshipPosts({
  internshipPosts: initialData = [],
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  },
  courses = [],
}) {
  const [internshipPosts, setInternshipPosts] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [scope, setScope] = useState("");
  const [courseId, setCourseId] = useState(null);
  const [workType, setWorkType] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const { user } = useUser();
  const userId = user.id;
  const userRole = user.role;

  // Tracks which request is the most recent one, so a slow-resolving
  // stale request can never overwrite a newer one's result
  const requestIdRef = useRef(0);

  // Debounce ALL filter changes (buttons + search) behind one timer.
  // Any change — clicking a button or typing — resets the same timer,
  // so rapid clicking/typing only results in one fetch after things settle.
  useEffect(() => {
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

        // If a newer request has started since this one was scheduled,
        // ignore this result — it's stale
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
    }, 500); // 400ms debounce window — adjust to taste

    return () => clearTimeout(timeout);
  }, [workType, courseId, scope, query]);

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

      if (thisRequestId !== requestIdRef.current) return; // stale, ignore

      if (newData?.error) {
        console.error("Error loading more internship posts:", newData.error);
        return;
      }

      const incoming = newData?.data || [];

      setInternshipPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = incoming.filter((p) => !existingIds.has(p.id));
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
          <div className="flex rounded-lg bg-stone-200 p-1">
            {scopeTabs.map((s) => (
              <button
                key={s.value}
                onClick={() => setScope(s.value)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  scope === s.value
                    ? "bg-primary-500 text-primary-foreground"
                    : "bg-stone-200 text-muted-foreground hover:text-primary-500"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {courses.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {/* All button in courses*/}
          <button
            onClick={() => setCourseId(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !courseId
                ? "bg-primary-500 text-primary-foreground"
                : "bg-stone-200 text-muted-foreground hover:text-primary-500"
            }`}
          >
            All
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setCourseId(c.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                courseId === c.id
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-stone-200 text-muted-foreground hover:text-primary-500"
              }`}
            >
              {c.short_name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {workTypeTabs.map((wt) => (
            <button
              key={wt.label}
              onClick={() => setWorkType(wt.workType)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                workType === wt.workType
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-stone-200 text-muted-foreground hover:text-primary-500"
              }`}
            >
              {wt.label}
            </button>
          ))}
        </div>

        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or position..."
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {total ? total : null} listings
      </p>

      {/* Listings */}
      <div className="space-y-5">
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
          <p className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            No internship listings found.
          </p>
        )}
      </div>

      {currentPage < totalPages && (
        <li className="w-full">
          <button
            onClick={handleSeeMore}
            disabled={isPending}
            className="w-full pl-12 md:pl-16 text-center text-lg font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </li>
      )}
    </>
  );
}

export default InternshipPosts;
