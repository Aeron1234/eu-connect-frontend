"use client";

function DtrPagination({ page, totalPages = 1, onPageChange, disabled = false }) {
  const lastPage = Math.max(1, totalPages);
  return (
    <nav aria-label="Time records pagination" className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
        className="rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span>Page {page} / {lastPage}</span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= lastPage}
        className="rounded-md px-2 py-1 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

export default DtrPagination;
