"use client";

import { notifyReadError } from "@/lib/client-read-error";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import PostAnnouncementButton from "../internship-records-ui/PostAnnouncementButton";
import AnnouncementCard from "./AnnouncementCard";
import AnnouncementsFilter from "./AnnouncementsFilter";
import SearchBar from "../ui/SearchBar";
import { useUser } from "@/contexts/UserContext";
import PageTitle from "../ui/PageTitle";
import AnnouncementCardSkeleton from "../skeletons/AnnouncementCardSkeleton";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import {
  announcementsInfiniteOptions,
  announcementsKeys,
} from "@/lib/cache/announcements-queries";

const defaultFilters = { category: "all", search: "" };

function AnnouncementBoard({
  categories = [],
  initialPinned = [],
  initialRegular = [],
  initialTotalPages = 1,
  initialTotalRecords = 0,
}) {
  const { user } = useUser();
  const userRole = user.role;
  const queryClient = useQueryClient();

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
      filters.category === "all" && filters.search === ""
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
    if (announcementsQuery.error) {
      notifyReadError("Error loading announcements:", announcementsQuery.error);
    }
  }, [announcementsQuery.error]);

  useEffect(() => {
    const previous = serverSnapshotRef.current;
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
  }

  const pinnedIds = new Set(pinned.map((p) => p.id));
  const filteredRegular = regular.filter((a) => !pinnedIds.has(a.id));
  const isPinnedExist = pinned.length > 0;

  return (
    <main className="flex-1 space-y-6 overflow-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={Megaphone}
          title={"Announcements"}
          description={"Stay updated with the latest internship news."}
        />

        <PostAnnouncementButton
          categories={categories || []}
          onPosted={refreshList}
        />
      </div>

      <div
        className={`flex ${userRole !== "employer" ? "flex-col gap-4 sm:flex-row sm:items-center" : ""}`}
      >
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search announcements..."
          ariaLabel="Search announcements"
          position={userRole !== "employer" ? "right" : "left"}
        />

        <AnnouncementsFilter
          categories={categories || []}
          category={category}
          setCategory={handleCategoryChange}
        />
      </div>

      {isSearching ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <AnnouncementCardSkeleton key={i} showEventDate={i % 2 === 0} />
          ))}
        </div>
      ) : announcementsQuery.isError && !announcementsQuery.data ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">Could not load announcements.</p>
          <button type="button" onClick={() => void announcementsQuery.refetch()} className="mt-3 text-sm font-semibold text-primary-emphasis">
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {isPinnedExist && (
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary-emphasis">
                Pinned
              </p>
              <ul className="flex flex-col gap-3">
                {pinned.map((announcement) => (
                  <li key={`pinned-${announcement.id}`}>
                    <AnnouncementCard
                      announcement={announcement}
                      categories={categories}
                      onChanged={refreshList}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {filteredRegular.length > 0 ? (
            <div>
              {isPinnedExist && (
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-foreground-subtle">
                  Earlier
                </p>
              )}
              <ul className="flex flex-col gap-3">
                {filteredRegular.map((announcement) => (
                  <li key={`reg-${announcement.id}`}>
                    <AnnouncementCard
                      announcement={announcement}
                      categories={categories}
                      onChanged={refreshList}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            !isPinnedExist && (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card border-border py-16 text-center">
                <Megaphone className="size-8 text-foreground-faint" />
                <p className="text-sm text-muted-foreground">
                  No announcements found.
                </p>
              </div>
            )
          )}
        </div>
      )}

      {!isSearching && announcementsQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => void announcementsQuery.fetchNextPage()}
          disabled={isLoadingMore}
          className="w-full text-center text-lg font-semibold text-foreground-soft transition hover:text-primary-emphasis disabled:opacity-50"
        >
          {isLoadingMore ? "Loading..." : "See more"}
        </button>
      )}
    </main>
  );
}

export default AnnouncementBoard;
