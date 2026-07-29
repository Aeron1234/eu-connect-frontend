"use client";

import { format } from "date-fns";
import Modal from "./Modal";
import { useEffect, useState } from "react";
import { fetchMoreSearchedStudentNarratives } from "../_services/services";

function StudentNarratives({
  narratives: initialData = [],
  totalPages: initialTotalPages = 1,
  searchedUserId,
}) {
  const [narratives, setNarratives] = useState(initialData || []);
  const [isPending, setIsPending] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);

  // useEffect(() => {}, [initialData, initialTotalPages]);

  async function handleSeeMore() {
    if (isPending || page >= totalPages) return;
    setIsPending(true);
    const nextPage = page + 1;

    try {
      const newData = await fetchMoreSearchedStudentNarratives({
        page: nextPage,
        searchedUserId,
      });

      console.log("nextPage:", nextPage, "newData:", newData);
      const incoming = newData?.narratives || [];

      setNarratives((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const filteredNew = incoming.filter((n) => !existingIds.has(n.id));
        return [...prev, ...filteredNew];
      });

      // setNarratives((prev) => [...prev, ...incoming]);

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
    <ul className="space-y-4">
      {narratives.length === 0 ? (
        <li className="border border-stone-200 rounded-xl text-stone-500 text-sm text-center py-8 bg-white shadow-sm">
          No narratives submitted yet.
        </li>
      ) : (
        narratives.map((n) => (
          <li
            key={n.id}
            className="border border-stone-200 rounded-xl p-4 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-primary-500 text-xs">
                Day {n.day_number}
              </h3>
              <span className="text-xs text-stone-500">
                {format(new Date(n.created_at), "MM/dd/yyyy")}
              </span>
            </div>
            <h3 className="font-medium mb-2">{n.title}</h3>
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
          </li>
        ))
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
  );
}

export default StudentNarratives;
