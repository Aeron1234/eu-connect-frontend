"use client";

import { useEffect, useRef, useState } from "react";
import DtrTable from "./DtrTable";
import { getDtrs, deleteDtr } from "@/lib/server-actions/dtr-actions";
import { toastAndAction } from "../../lib/helpers";
import DtrRecordsSkeleton from "./DtrRecordsSkeleton";

function StudentDashboardDtrTable({
  dtrData: initialDtrData = {},
  currentDtrPage: initialPage = 1,
}) {
  const [page, setPage] = useState(initialPage);
  const [dtrs, setDtrs] = useState(initialDtrData?.dtrs || []);
  const [totalPages, setTotalPages] = useState(initialDtrData?.totalPages || 1);
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const newData = await getDtrs(page);

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error("Error loading DTR page:", newData.error);
          return;
        }

        setDtrs(newData?.dtrs || []);
        if (newData?.totalPages) setTotalPages(newData.totalPages);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading DTR page:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [page]);

  function goToPage(nextPage) {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
  }

  // Optimistically removes the row the instant delete is requested, and
  // restores it (at its original index) if the server action reports an
  // error — same snapshot/rollback pattern used elsewhere in this app
  // (PostedEvaluationItem, EvaluationCriteriaPageContent, etc.).
  function handleDelete(dtrId) {
    const snapshot = dtrs;
    const removedIndex = dtrs.findIndex((d) => d.id === dtrId);
    const removedItem = dtrs[removedIndex];

    setDtrs((prev) => prev.filter((d) => d.id !== dtrId));

    const formData = new FormData();
    formData.append("dtrId", dtrId);

    toastAndAction({
      loadingLabel: "Deleting record...",
      successLabel: "Record deleted.",
      errorLabel: "Failed to delete record.",
      action: deleteDtr,
      formData,
    }).then((result) => {
      if (result?.error) {
        setDtrs((prev) => {
          const next = [...prev];
          next.splice(removedIndex, 0, removedItem);
          return next;
        });
      }
    });
  }

  return (
    <div className="relative">
      {isPending ? (
        <DtrRecordsSkeleton />
      ) : (
        <section className="rounded-xl bg-card border border-border shadow-sm p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
            <span className="w-4 h-4 rounded-full border-2 border-primary flex-shrink-0" />
            Recent Time Records
          </h3>
          <div className="overflow-x-auto">
            <DtrTable
              dtrs={dtrs}
              totalPages={totalPages}
              currentDtrPage={page}
              isStudentDashboard={true}
              onPageChange={goToPage}
              onDelete={handleDelete}
            />
          </div>
        </section>
      )}
    </div>
  );
}

export default StudentDashboardDtrTable;
