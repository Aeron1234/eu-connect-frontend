"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";

function DtrPagination({ page, totalPages = 1, onPageChange, disabled = false }) {
  const lastPage = Math.max(1, totalPages);
  return (
    <nav aria-label="Time records pagination" className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        aria-label="Previous time records page"
        className="grid size-9 place-items-center rounded-md text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      <span>Page {page} / {lastPage}</span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= lastPage}
        aria-label="Next time records page"
        className="grid size-9 place-items-center rounded-md text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

export default DtrPagination;
