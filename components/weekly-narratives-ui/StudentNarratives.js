"use client";

import { notifyReadError } from "@/lib/client-read-error";

import { format } from "date-fns";
import Modal from "../ui/Modal";
import { useEffect, useRef, useState } from "react";
import { fetchMoreSearchedStudentWeeklyNarrativesResult as fetchMoreSearchedStudentWeeklyNarratives } from "@/lib/server-actions/weekly-narratives-actions";
import {
  canKeepLoadedPages,
  hasValidPage,
  pageAfterRefresh,
  reconcilePageOne,
} from "@/lib/see-more-pagination.mjs";

function StudentNarratives({
  narratives: initialData = [],
  totalPages: initialTotalPages = 1,
  totalRecords: initialTotalRecords = 0,
  searchedUserId,
}) {
  const [narratives, setNarratives] = useState(initialData || []);
  const [isPending, setIsPending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
  const firstPageIdsRef = useRef(initialData.map((n) => n.id));
  const firstPageTotalRef = useRef(initialTotalRecords);
  const lastSnapshotRef = useRef({
    data: initialData,
    totalPages: initialTotalPages,
    totalRecords: initialTotalRecords,
    searchedUserId,
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const previous = lastSnapshotRef.current;
    if (
      previous.data === initialData &&
      previous.totalPages === initialTotalPages &&
      previous.totalRecords === initialTotalRecords &&
      previous.searchedUserId === searchedUserId
    )
      return;
    lastSnapshotRef.current = {
      data: initialData,
      totalPages: initialTotalPages,
      totalRecords: initialTotalRecords,
      searchedUserId,
    };
    const keepLoadedPages =
      previous.searchedUserId === searchedUserId &&
      canKeepLoadedPages(
        firstPageIdsRef.current,
        firstPageTotalRef.current,
        initialData,
        initialTotalRecords,
      );
    firstPageIdsRef.current = initialData.map((n) => n.id);
    firstPageTotalRef.current = initialTotalRecords;
    if (!keepLoadedPages) {
      requestIdRef.current += 1;
      setIsPending(false);
    }
    setNarratives((current) =>
      reconcilePageOne(current, initialData, keepLoadedPages),
    );
    setPage((current) => pageAfterRefresh(current, keepLoadedPages));
    setTotalPages(initialTotalPages || 1);
  }, [initialData, initialTotalPages, initialTotalRecords, searchedUserId]);

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await fetchMoreSearchedStudentWeeklyNarratives({
        page: nextPage,
        searchedUserId,
      });
      if (thisRequestId !== requestIdRef.current) return;

      if (!hasValidPage(newData, "narratives", null, nextPage)) {
        notifyReadError(
          "Error loading more weekly narratives:",
          newData?.error || "Invalid response from the server",
        );
        return;
      }
      const incoming = newData.narratives;

      setNarratives((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const filteredNew = incoming.filter((n) => !existingIds.has(n.id));
        return [...prev, ...filteredNew];
      });

      setPage(nextPage);
      if (newData?.totalPages) {
        setTotalPages(newData.totalPages);
      }
    } catch (error) {
      if (thisRequestId === requestIdRef.current)
        notifyReadError("Error loading more weekly narratives:", error);
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  return (
    <ul className="space-y-3 sm:space-y-4">
      {narratives.length === 0 ? (
        <li className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <p className="text-sm text-muted-foreground">
            No narratives submitted yet.
          </p>
        </li>
      ) : (
        narratives.map((n) => (
          <li
            key={n.id}
            className="border border-border rounded-xl p-4 sm:p-5 bg-card shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-primary-emphasis text-xs">
                Week {n.week_number}
              </h3>
              <span className="text-xs text-muted-foreground">
                {format(new Date(n.created_at), "MM/dd/yyyy")}
              </span>
            </div>
            <h3 className="font-medium text-foreground mb-2">{n.title}</h3>
            <p className="text-sm text-foreground-soft leading-relaxed mt-3 line-clamp-3">
              {n.narrative}
            </p>

            <Modal
              title={
                <p className="text-xs text-muted-foreground">
                  {format(new Date(n.created_at), "MMMM-dd-yyyy")} · Week{" "}
                  {n.week_number}
                </p>
              }
              description={
                <span className="text-lg font-bold text-foreground block">
                  {n.title || "Untitled"}
                </span>
              }
              trigger={
                <div className="text-xs font-semibold text-primary-emphasis hover:underline mt-3 cursor-pointer">
                  Read more →
                </div>
              }
            >
              <div className="bg-card rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {n.narrative}
                </p>
              </div>
            </Modal>
          </li>
        ))
      )}

      {page < totalPages && (
        <li className="w-full">
          <button
            onClick={handleSeeMore}
            disabled={isPending}
            className="w-full text-center text-sm sm:text-base font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </li>
      )}
    </ul>
  );
}

export default StudentNarratives;
