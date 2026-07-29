"use client";

import { Calendar, Edit2, Trash2 } from "lucide-react";
import Modal from "./Modal";
import DailyNarrativeEditForm from "./DailyNarrativeEditForm";
import DailyNarrativeDelete from "./DailyNarrativeDelete";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import { fetchMoreDailyNarratives } from "../_services/student-actions";

function DailyNarrativeContent({
  narratives: initialData = [],
  totalPages: initialTotalPages = 1,
}) {
  const pathName = usePathname();

  const [narratives, setNarratives] = useState(initialData || []);
  const [page, setPage] = useState(1);
  const [isPending, setIsPending] = useState(false);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

  // Remembers which ids were on page 1 as of the LAST time this effect ran
  const prevPage1IdsRef = useRef(new Set(initialData.map((n) => n.id)));

  useEffect(() => {
    const freshMap = new Map(initialData.map((item) => [item.id, item]));
    const prevPage1Ids = prevPage1IdsRef.current;

    setNarratives((prev) => {
      if (prev.length === 0) return initialData;

      const updatedList = prev
        // 1. update items with fresh server data if available
        .map((item) => freshMap.get(item.id) || item)
        // 2. drop items that WERE on page 1 before, but are no longer
        //    in the fresh page 1 response (i.e. deleted on the backend)
        .filter((item) => {
          const wasOnPage1Before = prevPage1Ids.has(item.id);
          const isStillFresh = freshMap.has(item.id);
          return !wasOnPage1Before || isStillFresh;
        });

      // 3. prepend brand-new items that appeared at the top of page 1
      const existingIds = new Set(updatedList.map((n) => n.id));
      const brandNew = initialData.filter((n) => !existingIds.has(n.id));

      return [...brandNew, ...updatedList];
    });

    setTotalPages(initialTotalPages || 1);

    // remember this run's page-1 ids for the NEXT diff
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
      const newData = await fetchMoreDailyNarratives({ page: nextPage });
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
      console.error("Error loading more daily narratives:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      {pathName === "/student/narratives" && narratives.length > 0 && (
        <div className="absolute left-4 md:left-6 top-2 bottom-2 w-px bg-border" />
      )}
      <ul className="space-y-4">
        {narratives.map((n) => (
          <li
            key={`${n.id}-${n.updated_at || n.created_at}`}
            className="relative pl-12 md:pl-16"
          >
            <div className="absolute left-0 md:left-2 top-4 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shadow-md ring-4 ring-background">
              {n.day_number}
            </div>
            <article className="rounded-xl bg-card border p-4 sm:p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-semibold text-stone-800">
                    {n.title}
                  </h2>
                  <p className="flex items-center gap-1.5 text-xs text-stone-600 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />{" "}
                    {format(new Date(n.created_at), "MMMM-dd-yyyy")} · Day{" "}
                    {n.day_number}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {/* EDIT MODAL */}
                  <Modal
                    title={"Update your narrative"}
                    description="Do you want to change something?"
                    trigger={
                      <div
                        aria-label="View"
                        className="p-1.5 rounded hover:bg-accent text-stone-600 hover:text-stone-800 transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </div>
                    }
                  >
                    <DailyNarrativeEditForm
                      narrative={n}
                      onSuccess={(updated) => handleItemUpdate(updated)}
                    />
                  </Modal>

                  {/* DELETE MODAL */}
                  <Modal
                    title={
                      <span className="text-red-600">Delete Narrative</span>
                    }
                    trigger={
                      <div
                        aria-label="Delete"
                        className="p-1.5 rounded hover:bg-accent text-stone-600 hover:text-primary-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </div>
                    }
                    description={
                      "Are you sure you want to delete this narrative?"
                    }
                  >
                    <DailyNarrativeDelete
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
                    {format(new Date(n.created_at), "MMMM-dd-yyyy")} · Day{" "}
                    {n.day_number}
                  </p>
                }
                description={
                  <span className="text-lg font-bold text-stone-900 block">
                    {n.title || "Untitled"}
                  </span>
                }
                trigger={
                  <div className="text-xs font-semibold text-primary-500 hover:underline mt-3 cursor-pointer">
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
        ))}

        {narratives.length === 0 && (
          <li className="pl-12 md:pl-16 py-10 text-center text-sm text-stone-600">
            No narratives yet.
          </li>
        )}

        {page < totalPages && (
          <li className="w-full">
            <button
              onClick={handleSeeMore}
              disabled={isPending}
              className="w-full pl-12 md:pl-16 text-center text-lg font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
            >
              {isPending ? "Loading..." : "See more"}
            </button>
          </li>
        )}
      </ul>
    </>
  );
}

export default DailyNarrativeContent;
