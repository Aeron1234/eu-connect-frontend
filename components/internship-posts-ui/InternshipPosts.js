"use client";

import { notifyReadError } from "@/lib/client-read-error";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { BriefcaseBusiness } from "lucide-react";
import InternshipPostsList from "./InternshipPostsList";
import SearchBar from "../ui/SearchBar";
import DropdownFilter from "../ui/DropdownFilter";
import { useUser } from "@/contexts/UserContext";
import InternshipPostsListSkeleton from "../skeletons/InternshipPostsListSkeleton";
import {
  canKeepLoadedPostingPages,
} from "@/lib/internship-posts-pagination.mjs";
import {
  internshipPostsInfiniteOptions,
  internshipPostsKeys,
  isFavoriteInternshipPostsQuery,
} from "@/lib/cache/internship-posts-queries";

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
  workType: initialWorkType = "",
  courseId: initialCourseId = "",
  scope: initialScope = "",
}) {
  const [query, setQuery] = useState("");
  const [workType, setWorkType] = useState(initialWorkType);
  const [courseId, setCourseId] = useState(initialCourseId);
  const [scope, setScope] = useState(initialScope);
  const [favorite, setFavorite] = useState("");
  const [debouncedFilters, setDebouncedFilters] = useState({
    workType: initialWorkType,
    courseId: initialCourseId,
    search: "",
    mine: initialScope === "myposts" ? "true" : "",
    favorite: "",
  });
  const { user } = useUser();
  const userId = user.id;
  const userRole = user.role;
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialData);
  const initialFilters = useMemo(
    () => ({
      workType: initialWorkType,
      courseId: initialCourseId,
      search: "",
      mine: initialScope === "myposts" ? "true" : "",
      favorite: "",
    }),
    [initialWorkType, initialCourseId, initialScope],
  );

  useEffect(() => {
    const nextFilters = {
      workType,
      courseId,
      search: query,
      mine: scope === "myposts" ? "true" : "",
      favorite,
    };
    const timeout = setTimeout(() => setDebouncedFilters(nextFilters), 500);
    return () => clearTimeout(timeout);
  }, [query, workType, courseId, scope, favorite]);

  const isChangingFilters =
    debouncedFilters.workType !== workType ||
    debouncedFilters.courseId !== courseId ||
    debouncedFilters.search !== query ||
    debouncedFilters.mine !== (scope === "myposts" ? "true" : "") ||
    debouncedFilters.favorite !== favorite;
  const matchesInitialFilters = Object.keys(initialFilters).every(
    (key) => debouncedFilters[key] === initialFilters[key],
  );
  const postsQuery = useInfiniteQuery({
    ...internshipPostsInfiniteOptions(userId, debouncedFilters),
    initialData: matchesInitialFilters
      ? {
          pages: [
            {
              data: initialData,
              pagination: {
                page: initialPage,
                total: initialTotal,
                totalPages: initialTotalPages,
              },
            },
          ],
          pageParams: [1],
        }
      : undefined,
  });

  const internshipPosts = useMemo(() => {
    const seen = new Set();
    return (postsQuery.data?.pages ?? []).flatMap((page) =>
      page.data.filter((post) => {
        if (seen.has(keyOf(post))) return false;
        seen.add(keyOf(post));
        return true;
      }),
    );
  }, [postsQuery.data]);
  const total = postsQuery.data?.pages[0]?.pagination?.total ?? 0;
  const isPending = isChangingFilters || postsQuery.isPending || postsQuery.isFetching;

  useEffect(() => {
    if (postsQuery.error) {
      notifyReadError("Error loading internship posts:", postsQuery.error);
    }
  }, [postsQuery.error]);

  // revalidatePath can stream a fresh first page while this component remains
  // mounted. Reconcile that snapshot without discarding stable loaded pages.
  useEffect(() => {
    if (serverSnapshotRef.current === initialData) return;
    serverSnapshotRef.current = initialData;
    queryClient.setQueryData(
      internshipPostsKeys.list(userId, initialFilters),
      (old) => {
        if (!old?.pages?.length) return old;
        const previous = old.pages[0];
        const keepLoaded = canKeepLoadedPostingPages(
          previous.data.map(keyOf),
          previous.pagination.total,
          initialData,
          initialTotal,
        );
        const firstPage = {
          data: initialData,
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
      },
    );
  }, [initialData, initialFilters, initialPage, initialTotal, initialTotalPages, queryClient, userId]);

  function updateCachedPosts(transform) {
    queryClient.setQueriesData(
      { queryKey: internshipPostsKeys.all(userId) },
      (old) =>
        old?.pages
          ? {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                data: transform(page.data),
              })),
            }
          : old,
    );
  }

  function refreshPosts() {
    void queryClient.invalidateQueries({
      queryKey: internshipPostsKeys.all(userId),
    });
  }

  function handleFavoriteSettled(postingId, isFavorited) {
    updateCachedPosts((posts) =>
      posts.map((post) =>
        post.id === postingId ? { ...post, isFavorited } : post,
      ),
    );
    // The unfiltered list only needs its favorite flag updated. Filtered
    // lists need a fresh page because membership and totals can change.
    void queryClient.invalidateQueries({
      predicate: (cachedQuery) =>
        isFavoriteInternshipPostsQuery(userId, cachedQuery),
    });
  }

  function handleItemUpdate(updatedItem) {
    updateCachedPosts((posts) =>
      posts.map((post) =>
        post.id === updatedItem.id ? { ...post, ...updatedItem } : post,
      ),
    );
    refreshPosts();
  }

  function handleItemDelete(deletedId) {
    updateCachedPosts((posts) => posts.filter((post) => post.id !== deletedId));
    refreshPosts();
  }

  const workTypeOptions = workTypeTabs.map((wt) => ({
    value: wt.workType,
    label: wt.label,
  }));

  const courseOptions = [
    { value: "", label: "Courses" },
    ...courses.map((c) => ({ value: String(c.id), label: c.course_name })),
  ];

  return (
    <>
      {userRole === "employer" && (
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="flex rounded-lg bg-secondary p-1 w-fit">
            {scopeTabs.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScope(s.value)}
                className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  scope === s.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-primary-emphasis"
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
            className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
          />
          {courses.length > 0 && (
            <DropdownFilter
              value={courseId}
              onValueChange={setCourseId}
              options={courseOptions}
              placeholder="Course"
              className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
            />
          )}
          {userRole === "student" && (
            <DropdownFilter
              value={favorite}
              onValueChange={setFavorite}
              options={favoriteOptions}
              placeholder="All Posts"
              className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
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
      ) : postsQuery.isError && internshipPosts.length === 0 ? (
        <button
          type="button"
          onClick={() => void postsQuery.refetch()}
          className="text-sm font-medium text-primary-emphasis hover:underline"
        >
          Could not load internship listings. Try again.
        </button>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {internshipPosts.map((item) => (
            <InternshipPostsList
              key={item.id}
              item={item}
              userRole={userRole}
              courses={courses}
              onUpdate={handleItemUpdate}
              onDelete={() => handleItemDelete(item.id)}
              onFavoriteSettled={handleFavoriteSettled}
            />
          ))}

          {internshipPosts.length === 0 && !isPending && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
              <BriefcaseBusiness className="size-8 text-foreground-faint" />
              <p className="text-sm text-muted-foreground">
                No internship listings found.
              </p>
            </div>
          )}
        </div>
      )}

      {postsQuery.hasNextPage && (
        <div className="w-full">
          <button
            type="button"
            onClick={() => void postsQuery.fetchNextPage()}
            disabled={isPending}
            className="w-full text-center text-sm sm:text-lg font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </>
  );
}

export default InternshipPosts;
