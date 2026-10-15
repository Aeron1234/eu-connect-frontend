"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementCategoriesOptions } from "@/lib/cache/reference-queries";
import { useUser } from "@/contexts/UserContext";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import { calendarKeys } from "@/lib/cache/calendar-queries";
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
  const targetRef = useRef(null);
  const [highlightTarget, setHighlightTarget] = useState(false);
  const targetQuery = useQuery({
    ...announcementByIdOptions(user.id, targetId),
    enabled: Boolean(user.id && targetId),
  });
  const targetAnnouncement = targetQuery.data;

  useEffect(() => {
    if (!targetId || !targetAnnouncement?.id || !targetRef.current) return;
    const frame = requestAnimationFrame(() => {
      targetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightTarget(true);
    });
    const timer = setTimeout(() => setHighlightTarget(false), 250);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [targetId, targetAnnouncement?.id]);

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const serverSnapshotRef = useRef({ initialPinned, initialRegular, initialTotalPages, initialTotalRecords });

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

  const pinned = announcementsQuery.data?.pages[0]?.pinned ?? [];
  const regular = useMemo(() => {
    const seen = new Set();
    return (announcementsQuery.data?.pages ?? []).flatMap((result) =>
      result.regular.filter((announcement) => {
        if (seen.has(announcement.id)) return false;
        seen.add(announcement.id);
        return true;
      }),
    );
  }, [announcementsQuery.data]);
  const isLoadingMore = announcementsQuery.isFetchingNextPage;
  const isSearching =
    filters.category !== category ||
    filters.search !== search.trim() ||
    announcementsQuery.isPending ||
    announcementsQuery.isPlaceholderData;

  function showCachedFilters(nextFilters) {
    if (user?.id && queryClient.getQueryData(announcementsKeys.list(user.id, nextFilters))?.pages?.length) {
      setFilters(nextFilters);
    }
  }

  function handleSearchChange(event) {
    const value = event.target.value;
    setSearch(value);
    showCachedFilters({ category, search: value.trim() });
  }

  function handleCategoryChange(value) {
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

  const visiblePinned = pinned.filter((item) => item.id !== targetAnnouncement?.id);
  const pinnedIds = new Set(pinned.map((p) => p.id));
  const filteredRegular = regular.filter((a) => !pinnedIds.has(a.id) && a.id !== targetAnnouncement?.id);
  const isPinnedExist = visiblePinned.length > 0;

  return {
    categoriesQuery,
    categories,
    targetRef,
    highlightTarget,
    targetQuery,
    targetAnnouncement,
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
