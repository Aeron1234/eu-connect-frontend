"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementCategoriesOptions } from "@/lib/cache/reference-queries";
import { useUser } from "@/contexts/UserContext";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import { calendarKeys } from "@/lib/cache/calendar-queries";
import { getAnnouncementFeed } from "@/lib/announcement-feed.mjs";
import {
  announcementByIdOptions,
  announcementsInfiniteOptions,
  announcementsKeys,
} from "@/lib/cache/announcements-queries";

const defaultFilters = { category: "all", search: "" };

export default function useAnnouncementBoard({
  targetId = null,
  categories: initialCategories,
  initialPinned,
  initialRegular,
  initialTotalPages = 1,
  initialTotalRecords = 0,
}) {
  const { user } = useUser();
  const categoriesQuery = useQuery({
    ...announcementCategoriesOptions(user.id),
    enabled: Boolean(user.id),
  });
  const categories = categoriesQuery.data || initialCategories || [];
  const queryClient = useQueryClient();
  const boardRef = useRef(null);
  const targetRef = useRef(null);
  const scrolledTargetRef = useRef(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [navigationTargetId, setNavigationTargetId] = useState(targetId);
  const targetQuery = useQuery({
    ...announcementByIdOptions(user.id, targetId),
    enabled: Boolean(user.id && targetId),
  });
  // Legacy numeric links resolve to the public ID used by feed cards.
  const focusedAnnouncementId = targetQuery.data?.id ?? targetId;

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const serverSnapshotRef = useRef({ initialPinned, initialRegular, initialTotalPages, initialTotalRecords });

  useEffect(() => {
    if (!targetId) return;

    // The layout owns the scroll container, so navigation starts at its top.
    boardRef.current?.parentElement?.scrollTo({ top: 0, behavior: "instant" });
  }, [targetId]);

  useEffect(() => {
    const trimmedSearch = search.trim();
    if (filters.category === category && filters.search === trimmedSearch) return;
    const timeout = setTimeout(() => setFilters({ category, search: trimmedSearch }), 300);
    return () => clearTimeout(timeout);
  }, [category, search, filters.category, filters.search]);

  const announcementsQuery = useInfiniteQuery({
    ...announcementsInfiniteOptions(user.id, filters),
    initialData:
      Array.isArray(initialPinned) && Array.isArray(initialRegular) && filters.category === "all" && filters.search === ""
        ? {
            pages: [{
              pinned: initialPinned,
              regular: initialRegular,
              totalPages: initialTotalPages,
              totalRecords: initialTotalRecords,
              currentPage: 1,
            }],
            pageParams: [1],
          }
        : undefined,
  });

  const { pinned: visiblePinned, regular: filteredRegular, hasTarget } = useMemo(
    () => getAnnouncementFeed(announcementsQuery.data?.pages, focusedAnnouncementId),
    [announcementsQuery.data, focusedAnnouncementId],
  );
  const isLoadingMore = announcementsQuery.isFetchingNextPage;
  const isSearching =
    filters.category !== category ||
    filters.search !== search.trim() ||
    announcementsQuery.isPending ||
    announcementsQuery.isPlaceholderData;

  const isNavigatingToTarget = Boolean(
    targetId && navigationTargetId === targetId && targetQuery.isSuccess &&
    category === "all" && !search.trim() && !isSearching,
  );
  const { fetchNextPage, hasNextPage, isFetching, isError } = announcementsQuery;

  useEffect(() => {
    if (
      !isNavigatingToTarget || hasTarget || !hasNextPage || isFetching || isError ||
      scrolledTargetRef.current === targetId
    ) return;

    // Keep every preceding page in place instead of promoting the linked card.
    void fetchNextPage({ cancelRefetch: false });
  }, [isNavigatingToTarget, hasTarget, hasNextPage, isFetching, isError, fetchNextPage, targetId]);

  useEffect(() => {
    if (
      !isNavigatingToTarget || !hasTarget || !targetRef.current ||
      scrolledTargetRef.current === targetId
    ) return;

    const frame = requestAnimationFrame(() => {
      if (!targetRef.current) return;
      scrolledTargetRef.current = targetId;
      targetRef.current.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
      setHighlightedId(focusedAnnouncementId);
    });
    return () => cancelAnimationFrame(frame);
  }, [isNavigatingToTarget, hasTarget, targetId, focusedAnnouncementId]);

  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), 4_000);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  function showCachedFilters(nextFilters) {
    if (user?.id && queryClient.getQueryData(announcementsKeys.list(user.id, nextFilters))?.pages?.length) {
      setFilters(nextFilters);
    }
  }

  function handleSearchChange(event) {
    setNavigationTargetId(null);
    setHighlightedId(null);
    const value = event.target.value;
    setSearch(value);
    showCachedFilters({ category, search: value.trim() });
  }

  function handleCategoryChange(value) {
    setNavigationTargetId(null);
    setHighlightedId(null);
    setCategory(value);
    showCachedFilters({ category: value, search: search.trim() });
  }

  useEffect(() => {
    if (announcementsQuery.error && announcementsQuery.data) {
      notifyReadError("Error loading announcements:", announcementsQuery.error);
    }
  }, [announcementsQuery.error, announcementsQuery.data]);

  useEffect(() => {
    const previous = serverSnapshotRef.current;
    if (!Array.isArray(initialPinned) || !Array.isArray(initialRegular)) return;
    if (
      previous.initialPinned === initialPinned &&
      previous.initialRegular === initialRegular &&
      previous.initialTotalPages === initialTotalPages &&
      previous.initialTotalRecords === initialTotalRecords
    ) return;
    serverSnapshotRef.current = { initialPinned, initialRegular, initialTotalPages, initialTotalRecords };
    queryClient.setQueryData(announcementsKeys.list(user.id, defaultFilters), (old) => {
      const firstPage = {
        pinned: initialPinned,
        regular: initialRegular,
        totalPages: initialTotalPages,
        totalRecords: initialTotalRecords,
        currentPage: 1,
      };
      if (!old?.pages?.length) return { pages: [firstPage], pageParams: [1] };
      const previousFirstPage = old.pages[0];
      const samePinned =
        previousFirstPage.pinned.length === initialPinned.length &&
        previousFirstPage.pinned.every((item, index) => item.id === initialPinned[index].id);
      const keepLoaded = samePinned && canKeepLoadedPages(
        previousFirstPage.regular.map((item) => item.id),
        previousFirstPage.totalRecords,
        initialRegular,
        initialTotalRecords,
      );
      return {
        pages: keepLoaded ? [firstPage, ...old.pages.slice(1)] : [firstPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialPinned, initialRegular, initialTotalPages, initialTotalRecords, queryClient, user.id]);

  function refreshList() {
    queryClient.setQueriesData({ queryKey: announcementsKeys.all(user.id) }, (old) =>
      old?.pages?.length
        ? { pages: [old.pages[0]], pageParams: [1] }
        : old,
    );
    void queryClient.invalidateQueries({ queryKey: announcementsKeys.all(user.id) });
    void queryClient.invalidateQueries({ queryKey: calendarKeys.all(user.id) });
  }

  const isPinnedExist = visiblePinned.length > 0;

  return {
    categoriesQuery,
    categories,
    boardRef,
    targetRef,
    highlightTarget: highlightedId === focusedAnnouncementId && highlightedId != null,
    targetQuery,
    focusedAnnouncementId,
    category,
    search,
    announcementsQuery,
    isLoadingMore,
    isSearching,
    handleSearchChange,
    handleCategoryChange,
    refreshList,
    visiblePinned,
    filteredRegular,
    isPinnedExist,
  };
}
