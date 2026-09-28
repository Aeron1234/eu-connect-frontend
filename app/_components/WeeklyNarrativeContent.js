"use client";

import { Calendar, Edit2, Trash2 } from "lucide-react";
import Modal from "./Modal";
import WeeklyNarrativeEditForm from "./WeeklyNarrativeEditForm";
import WeeklyNarrativeDelete from "./WeeklyNarrativeDelete";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { fetchMoreWeeklyNarratives } from "@/lib/server-actions/weekly-narratives-actions";

function WeeklyNarrativeContent({
  narratives: initialData = [],
  totalPages: initialTotalPages = 1,
}) {
  const [narratives, setNarratives] = useState(initialData || []);
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

  const prevPage1IdsRef = useRef(new Set(initialData.map((n) => n.id)));

  useEffect(() => {
    const freshMap = new Map(initialData.map((item) => [item.id, item]));
    const prevPage1Ids = prevPage1IdsRef.current;

    setNarratives((prev) => {
      if (prev.length === 0) return initialData;

      const updatedList = prev
        .map((item) => freshMap.get(item.id) || item)
        .filter((item) => {
          const wasOnPage1Before = prevPage1Ids.has(item.id);
          const isStillFresh = freshMap.has(item.id);
          return !wasOnPage1Before || isStillFresh;
        });

      const existingIds = new Set(updatedList.map((n) => n.id));
      const brandNew = initialData.filter((n) => !existingIds.has(n.id));

      return [...brandNew, ...updatedList];
    });

    setTotalPages(initialTotalPages || 1);
    prevPage1IdsRef.current = new Set(initialData.map((n) => n.id));
  }, [initialData, initialTotalPages]);

  const handleItemUpdate = (updatedItem) => {
    setNarratives((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item,
      ),
    );
  };

  const handleItemDelete = (deletedId) => {
    setNarratives((prev) => prev.filter((item) => item.id !== deletedId));
  };

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;

    try {
      const newData = await fetchMoreWeeklyNarratives({ page: nextPage });
      const incoming = newData?.narratives || newData?.data || [];

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
      console.error("Error loading more weekly narratives:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="relative">
      {narratives.length > 0 && (
        <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-stone-200" />
      )}
      <ul className="space-y-3 sm:space-y-4">
        {narratives.length === 0 ? (
          <li className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 sm:py-20 text-center">
            <p className="text-sm text-stone-500">No narratives yet.</p>
          </li>
        ) : (
          narratives.map((n) => (
            <li
              key={`${n.id}-${n.updated_at || n.created_at}`}
              className="relative pl-10 sm:pl-14"
            >
              <div className="absolute left-0 sm:left-1 top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-md ring-4 ring-[#f5f5f4]">
                {n.week_number}
              </div>
              <article className="rounded-xl bg-white border border-stone-300 shadow-sm p-4 sm:p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-stone-800">
                      {n.title}
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />{" "}
                      {format(new Date(n.created_at), "MMMM d, yyyy")} · Week{" "}
                      {n.week_number}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Modal
                      title="Update your narrative"
                      description="Do you want to change something?"
                      trigger={
                        <div
                          aria-label="Edit"
                          className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition cursor-pointer"
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
                      description="Are you sure you want to delete this narrative?"
                      trigger={
                        <div
                          aria-label="Delete"
                          className="p-1.5 rounded-md hover:bg-red-50 text-stone-500 hover:text-red-600 transition cursor-pointer"
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

                <p className="text-sm text-stone-600 leading-relaxed mt-3 line-clamp-3">
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
                    <span className="text-lg font-bold text-stone-800 block">
                      {n.title || "Untitled"}
                    </span>
                  }
                  trigger={
                    <div className="text-xs font-semibold text-primary-500 hover:underline mt-3 cursor-pointer">
                      Read more →
                    </div>
                  }
                >
                  <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
                    <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
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
              className="w-full pl-10 sm:pl-14 text-center text-sm sm:text-base font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
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
