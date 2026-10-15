"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export default function NotificationDropdownPagination({
  inboxStatus, totalPages, totalRecords, page, handlePageChange,
}) {
  return (
    inboxStatus === "ready" && totalPages > 1 && (
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span>{totalRecords} updates · Page {page} of {totalPages}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => handlePageChange(page - 1)} disabled={page <= 1} aria-label="Previous notification page" className="grid size-7 place-items-center rounded-md transition hover:bg-accent disabled:opacity-40">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} aria-label="Next notification page" className="grid size-7 place-items-center rounded-md transition hover:bg-accent disabled:opacity-40">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    )
  );
}
