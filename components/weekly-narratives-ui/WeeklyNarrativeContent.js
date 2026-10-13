"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";

import { useEffect, useMemo, useRef } from "react";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import WeeklyNarrativeCard from "./WeeklyNarrativeCard";
import {
  weeklyNarrativesInfiniteOptions,
  weeklyNarrativesKeys,
} from "@/lib/cache/weekly-narratives-queries";

function WeeklyNarrativeContent({ initialPage, internshipId, showActions = true }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(null);
  const queryKey = useMemo(
    () => weeklyNarrativesKeys.list(user.id, internshipId),
    [user.id, internshipId],
  );
  const narrativesQuery = useInfiniteQuery({
    ...weeklyNarrativesInfiniteOptions(user.id, internshipId),
    initialData: initialPage
      ? { pages: [initialPage], pageParams: [1] }
      : undefined,
  });

  const narratives = useMemo(() => {
    const seen = new Set();
    return (narrativesQuery.data?.pages ?? []).flatMap((page) =>
      page.narratives.filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      }),
    );
  }, [narrativesQuery.data]);

  useEffect(() => {
    if (narrativesQuery.error) {
      notifyReadError(
        narrativesQuery.isFetchNextPageError
          ? "Error loading more weekly narratives:"
          : "Error loading weekly narratives:",
        narrativesQuery.error,
      );
    }
  }, [narrativesQuery.error, narrativesQuery.isFetchNextPageError]);

  useEffect(() => {
    if (serverSnapshotRef.current === initialPage || !initialPage) return;
    serverSnapshotRef.current = initialPage;
    queryClient.setQueryData(queryKey, (old) => {
      if (!old?.pages?.length) return old;
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

  function handleItemUpdate(updatedItem) {
    queryClient.setQueryData(queryKey, (old) => old?.pages?.length
      ? {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            narratives: page.narratives.map((item) =>
              item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
            ),
          })),
        }
      : old);
  }

  function handleItemDelete(deletedId) {
    queryClient.setQueryData(queryKey, (old) => old?.pages?.length
      ? {
          pages: [{
            ...old.pages[0],
            narratives: old.pages[0].narratives.filter((item) => item.id !== deletedId),
          }],
          pageParams: [1],
        }
      : old);
    void queryClient.invalidateQueries({ queryKey });
  }

  return (
    <div className="relative">
      {narratives.length > 0 && (
        <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-secondary" />
      )}
      <ul className="space-y-3 sm:space-y-4">
        {narratives.length === 0 ? (
          <li className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
            <p className="text-sm text-muted-foreground">No narratives yet.</p>
          </li>
        ) : (
          narratives.map((n) => (
            <WeeklyNarrativeCard
              key={`${n.id}-${n.updated_at || n.created_at}`}
              narrative={n}
              showActions={showActions}
              onUpdate={handleItemUpdate}
              onDelete={() => handleItemDelete(n.id)}
            />
          ))
        )}

        {narrativesQuery.hasNextPage && (
          <li className="w-full">
            <button
              onClick={() => void narrativesQuery.fetchNextPage()}
              disabled={narrativesQuery.isFetchingNextPage}
              className="w-full pl-10 sm:pl-14 text-center text-sm sm:text-base font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
            >
              {narrativesQuery.isFetchingNextPage ? "Loading..." : "See more"}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default WeeklyNarrativeContent;
