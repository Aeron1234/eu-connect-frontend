"use client";

import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, Loader2 } from "lucide-react";
import InternshipPostsList from "./InternshipPostsList";
import SearchBar from "./SearchBar";
import DropdownFilter from "./DropdownFilter";
import { getInternshipPosts } from "../_services/services";
import { useUser } from "@/contexts/UserContext";
import InternshipPostsListSkeleton from "./InternshipPostsListSkeleton";

const scopeTabs = [
  { label: "All Companies", value: "" },
  { label: "My Posts", value: "myposts" },
];

const workTypeTabs = [
  { label: "Work Type", workType: "" },
  { label: "On-site", workType: "on-site" },
  { label: "Hybrid", workType: "hybrid" },
  { label: "Remote", workType: "remote" },
];

const favoriteOptions = [
  { value: "", label: "All Posts" },
  { value: "favorited", label: "Marked Favorite" },
  { value: "not_favorited", label: "Not Favorite" },
];

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
}) {
  const [internshipPosts, setInternshipPosts] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [query, setQuery] = useState("");
  const [workType, setWorkType] = useState("");
  const [courseId, setCourseId] = useState("");
  const [scope, setScope] = useState("");
  const [favorite, setFavorite] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const { user } = useUser();
  const userId = user.id;
  const userRole = user.role;

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);
  const prevPage1KeysRef = useRef(new Set((initialData || []).map(keyOf)));

  const workTypeOptions = workTypeTabs.map((wt) => ({
    value: wt.workType,
    label: wt.label,
  }));

  const courseOptions = [
    { value: "", label: "Courses" },
    ...courses.map((c) => ({ value: String(c.id), label: c.course_name })),
  ];

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
          favorite,
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
  }, [query, workType, courseId, scope, favorite]);

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
        favorite,
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
      {userRole === "employer" && (
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-stone-200 p-1 w-fit">
            {scopeTabs.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScope(s.value)}
                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
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

      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or position..."
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <DropdownFilter
            value={workType}
            onValueChange={setWorkType}
            options={workTypeOptions}
            placeholder="Work Type"
            className="bg-white p-2 flex-1 sm:flex-0 rounded-md"
          />
          {courses.length > 0 && (
            <DropdownFilter
              value={courseId}
              onValueChange={setCourseId}
              options={courseOptions}
              placeholder="Course"
              className="bg-white p-2 flex-1 sm:flex-0 rounded-md"
            />
          )}
          {userRole === "student" && (
            <DropdownFilter
              value={favorite}
              onValueChange={setFavorite}
              options={favoriteOptions}
              placeholder="All Posts"
              className="bg-white p-2 flex-1 sm:flex-0 rounded-md"
            />
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {total ? total : null} listings
      </p>

      {isPending && internshipPosts.length === 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <InternshipPostsListSkeleton key={i} />
          ))}
        </div>
      ) : (
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
      )}

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
