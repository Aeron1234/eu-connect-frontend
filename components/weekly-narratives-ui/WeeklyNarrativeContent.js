"use client";

import { notifyReadError } from "@/lib/client-read-error";

import { Calendar, Edit2, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import WeeklyNarrativeEditForm from "./WeeklyNarrativeEditForm";
import WeeklyNarrativeDelete from "./WeeklyNarrativeDelete";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import {
  fetchMoreWeeklyNarrativesResult as fetchMoreWeeklyNarratives,
  getWeeklyNarrativesResult as getWeeklyNarratives,
} from "@/lib/server-actions/weekly-narratives-actions";
import {
  canKeepLoadedPages,
  hasValidPage,
  pageAfterRefresh,
  reconcilePageOne,
} from "@/lib/see-more-pagination.mjs";

function WeeklyNarrativeContent({
  narratives: initialData = [],
  totalPages: initialTotalPages = 1,
  totalRecords: initialTotalRecords = 0,
}) {
  const [narratives, setNarratives] = useState(initialData || []);
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

  const prevPage1IdsRef = useRef(initialData.map((n) => n.id));
  const prevTotalRef = useRef(initialTotalRecords);
  const lastServerSnapshotRef = useRef({
    data: initialData,
    totalPages: initialTotalPages,
    totalRecords: initialTotalRecords,
  });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const previous = lastServerSnapshotRef.current;
    if (
      previous.data === initialData &&
      previous.totalPages === initialTotalPages &&
      previous.totalRecords === initialTotalRecords
    )
      return;
    lastServerSnapshotRef.current = {
      data: initialData,
      totalPages: initialTotalPages,
      totalRecords: initialTotalRecords,
    };
    const keepLoadedPages = canKeepLoadedPages(
      prevPage1IdsRef.current,
      prevTotalRef.current,
      initialData,
      initialTotalRecords,
    );
    prevPage1IdsRef.current = initialData.map((n) => n.id);
    prevTotalRef.current = initialTotalRecords;
    if (!keepLoadedPages) {
      requestIdRef.current += 1;
      setIsPending(false);
    }
    setNarratives((prev) =>
      reconcilePageOne(prev, initialData, keepLoadedPages),
    );
    setPage((current) => pageAfterRefresh(current, keepLoadedPages));
    setTotalPages(initialTotalPages || 1);
  }, [initialData, initialTotalPages, initialTotalRecords]);

  const handleItemUpdate = (updatedItem) => {
    setNarratives((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
      ),
    );
  };

  async function handleItemDelete(deletedId) {
    setNarratives((prev) => prev.filter((item) => item.id !== deletedId));
    const thisRequestId = ++requestIdRef.current;
    setIsPending(true);
    try {
      const fresh = await getWeeklyNarratives();
      if (thisRequestId !== requestIdRef.current) return;
      if (!hasValidPage(fresh, "narratives", null)) {
        notifyReadError(
          "Error refreshing weekly narratives:",
          fresh?.error || "Invalid response from the server",
        );
        return;
      }
      setNarratives(fresh.narratives);
      setPage(1);
      setTotalPages(fresh.totalPages || 1);
    } catch (error) {
      if (thisRequestId === requestIdRef.current)
        notifyReadError("Error refreshing weekly narratives:", error);
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await fetchMoreWeeklyNarratives({ page: nextPage });
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
            <li
              key={`${n.id}-${n.updated_at || n.created_at}`}
              className="relative pl-10 sm:pl-14"
            >
              <div className="absolute left-0 sm:left-1 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-white flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-md ring-4 ring-canvas">
                {n.week_number}
              </div>
              <article className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-foreground">
                      {n.title}
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />{" "}
                      {format(new Date(n.created_at), "MMMM d, yyyy")} · Week{" "}
                      {n.week_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Modal
                      title="Update your narrative"
                      trigger={
                        <div
                          aria-label="Edit"
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </div>
                      }
                    >
                      <WeeklyNarrativeEditForm
                        narrative={n}
                        onSuccess={(updated) => handleItemUpdate(updated)}
                      />
                    </Modal>

                    <Modal
                      title={
                        <span className="text-red-600">Delete Narrative</span>
                      }
                      trigger={
                        <div
                          aria-label="Delete"
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </div>
                      }
                    >
                      <WeeklyNarrativeDelete
                        narrativeId={n.id}
                        onSuccess={() => handleItemDelete(n.id)}
                      />
                    </Modal>
                  </div>
                </div>

                <p className="text-sm text-foreground-soft leading-relaxed mt-3 line-clamp-3">
                  {n.narrative}
                </p>

                <Modal
                  title={
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(n.created_at), "MMMM d, yyyy")} · Week{" "}
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
              </article>
            </li>
          ))
        )}

        {page < totalPages && (
          <li className="w-full">
            <button
              onClick={handleSeeMore}
              disabled={isPending}
              className="w-full pl-10 sm:pl-14 text-center text-sm sm:text-base font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
            >
              {isPending ? "Loading..." : "See more"}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}

export default WeeklyNarrativeContent;
