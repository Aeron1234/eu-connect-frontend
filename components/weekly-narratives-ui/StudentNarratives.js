"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import WeeklyNarrativeListSkeleton from "@/components/skeletons/WeeklyNarrativeListSkeleton";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import WeeklyNarrativeCard from "./WeeklyNarrativeCard";
import {
  userProfileKeys,
  userProfileNarrativesInfiniteOptions,
} from "@/lib/cache/user-profile-queries";

function StudentNarratives({ initialPage, searchedUserId, viewerId }) {
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(null);
  const queryKey = useMemo(
    () => userProfileKeys.narrativePages(viewerId, searchedUserId),
    [viewerId, searchedUserId],
  );
  const narrativesQuery = useInfiniteQuery({
    ...userProfileNarrativesInfiniteOptions(viewerId, searchedUserId),
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [1] }
      : undefined,
  });

  const narratives = useMemo(() => {
    const seen = new Set();
    return (narrativesQuery.data?.pages || []).flatMap((page) =>
      page.narratives.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }),
    );
  }, [narrativesQuery.data]);

  useEffect(() => {
    if (!initialPage || serverSnapshotRef.current === initialPage) return;
    serverSnapshotRef.current = initialPage;
    queryClient.setQueryData(queryKey, (old) => {
      if (!old?.pages?.length) {
        return { pages: [initialPage], pageParams: [1] };
      }
      const previous = old.pages[0];
      const keepLoaded = canKeepLoadedPages(
        previous.narratives.map((item) => item.id),
        previous.totalRecords,
        initialPage.narratives,
        initialPage.totalRecords,
      );
      return {
        pages: keepLoaded ? [initialPage, ...old.pages.slice(1)] : [initialPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialPage, queryClient, queryKey]);

  function handleSeeMore() {
    if (narrativesQuery.hasNextPage && !narrativesQuery.isFetchingNextPage) {
      void narrativesQuery.fetchNextPage();
    }
  }

  const isPending = narrativesQuery.isFetchingNextPage;

  if (narrativesQuery.isPending) return <WeeklyNarrativeListSkeleton />;
  if (narrativesQuery.isError && !narrativesQuery.data) {
    return <ErrorUI error={narrativesQuery.error} reset={() => void narrativesQuery.refetch()} compact logError={false} />;
  }

  return (
    <div className="relative">
      {narratives.length > 0 && (
        <div className="absolute bottom-2 left-4 top-2 w-px bg-secondary sm:left-6" />
      )}
      <ul className="space-y-3 sm:space-y-4">
        {narratives.length === 0 ? (
          <li className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
            <p className="text-sm text-muted-foreground">
              No narratives submitted yet.
            </p>
          </li>
        ) : (
          narratives.map((n) => (
            <WeeklyNarrativeCard
              key={`${n.id}-${n.updated_at || n.created_at}`}
              narrative={n}
            />
          ))
        )}

        {narrativesQuery.hasNextPage && (
          <li className="w-full">
            <button
              onClick={handleSeeMore}
              disabled={isPending}
              className="w-full pl-10 text-center text-sm font-semibold text-foreground-soft transition hover:text-primary-emphasis disabled:opacity-50 sm:pl-14 sm:text-base"
            >
              {isPending ? "Loading..." : "See more"}
            </button>
          </li>
        )}
      </ul>
      {narrativesQuery.isError && (
        <ErrorUI error={narrativesQuery.error} compact logError={false} reset={() => {
          if (narrativesQuery.isFetchNextPageError) void narrativesQuery.fetchNextPage();
          else void narrativesQuery.refetch();
        }} />
      )}
    </div>
  );
}

export default StudentNarratives;
