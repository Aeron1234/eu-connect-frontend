"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesOptions } from "@/lib/cache/reference-queries";
import { dashboardListsKeys } from "@/lib/cache/dashboard-lists-queries";
import { useUser } from "@/contexts/UserContext";
import { canKeepLoadedPostingPages } from "@/lib/internship-posts-pagination.mjs";
import {
  internshipPostsInfiniteOptions,
  internshipPostsKeys,
  isFavoriteInternshipPostsQuery,
} from "@/lib/cache/internship-posts-queries";
import { workTypeTabs } from "./internshipPostOptions";

function keyOf(post) {
  return post.id;
}

// Coordinate posting filters, loaded pages and list reconciliation after card mutations.
// Keep favorite changes and refreshed page boundaries consistent with the active filters.
export default function useInternshipPosts({
  internshipPosts: initialData,
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  } = {},
  courses: initialCourses,
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
  const coursesQuery = useQuery({ ...coursesOptions(userId), enabled: Boolean(userId) });
  const courses = coursesQuery.data || initialCourses || [];
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
    const timeout = setTimeout(() => setDebouncedFilters(previous => ({ ...previous, search: query })), 500);
    return () => clearTimeout(timeout);
  }, [query]);

  function changeFilter(key, value) {
    switch (key) {
      case "workType": setWorkType(value); break;
      case "courseId": setCourseId(value); break;
      case "mine": setScope(value ? "myposts" : ""); break;
      case "favorite": setFavorite(value); break;
    }
    setDebouncedFilters(previous => ({ ...previous, [key]: value }));
  }

  function changeSearch(nextSearch) {
    setQuery(nextSearch);
    const nextFilters = { ...debouncedFilters, search: nextSearch };
    if (queryClient.getQueryData(internshipPostsKeys.list(userId, nextFilters))?.pages?.length) {
      setDebouncedFilters(nextFilters);
    }
  }

  const isChangingFilters =
    debouncedFilters.workType !== workType ||
    debouncedFilters.courseId !== courseId ||
    debouncedFilters.search !== query ||
    debouncedFilters.mine !== (scope === "myposts" ? "true" : "") ||
    debouncedFilters.favorite !== favorite;
  // Seed server rows only under the filters that produced them; other filter sets
  // use their own query cache and page stack.
  const matchesInitialFilters = Object.keys(initialFilters).every(
    (key) => debouncedFilters[key] === initialFilters[key],
  );
  const postsQuery = useInfiniteQuery({
    ...internshipPostsInfiniteOptions(userId, debouncedFilters),
    initialData: matchesInitialFilters && Array.isArray(initialData)
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
  const isPending = isChangingFilters || postsQuery.isPending || postsQuery.isPlaceholderData;

  useEffect(() => {
    if (postsQuery.error && postsQuery.data) {
      notifyReadError("Error loading internship posts:", postsQuery.error);
    }
  }, [postsQuery.error, postsQuery.data]);

  // revalidatePath can stream a fresh first page while this component remains
  // mounted. Reconcile that snapshot without discarding stable loaded pages.
  useEffect(() => {
    if (!Array.isArray(initialData) || serverSnapshotRef.current === initialData) return;
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

  // Patch this viewer's cached rows across filter/page variants. Membership and totals
  // still need a server refresh when content or favorite filters change.
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
      queryKey: dashboardListsKeys.employerJobsAll(userId),
    });
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

  // Apply the confirmed saved row immediately, then invalidate lists because course,
  // work type, search matches and owner/dashboard views may be affected.
  function handleItemUpdate(updatedItem) {
    updateCachedPosts((posts) =>
      posts.map((post) =>
        post.id === updatedItem.id ? { ...post, ...updatedItem } : post,
      ),
    );
    refreshPosts();
  }

  // Remove the confirmed deleted ID from loaded variants, then refetch authoritative
  // membership and totals instead of calculating them from visible rows alone.
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

  return {
    query,
    setQuery: changeSearch,
    workType,
    setWorkType: value => changeFilter("workType", value),
    courseId,
    setCourseId: value => changeFilter("courseId", value),
    scope,
    setScope: value => changeFilter("mine", value === "myposts" ? "true" : ""),
    favorite,
    setFavorite: value => changeFilter("favorite", value),
    userRole,
    courses,
    coursesQuery,
    postsQuery,
    internshipPosts,
    total,
    isPending,
    handleItemUpdate,
    handleItemDelete,
    handleFavoriteSettled,
    workTypeOptions,
    courseOptions,
  };
}
