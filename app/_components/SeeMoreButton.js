"use client";

import { Loader2 } from "lucide-react"; // Or any spinner icon

function SeeMoreButton({ onClick, isPending, currentPage, totalPages, label }) {
  const hasMore = currentPage < totalPages;

  // If we're on the last page, don't show the button
  if (!hasMore) return null;

  return (
    <div className="w-full my-2 flex justify-center">
      <button
        onClick={onClick}
        disabled={isPending}
        className="flex items-center gap-2 px-6 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-stone-600 hover:text-primary-500 font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading {label}s...
          </>
        ) : (
          `See more ${label}s`
        )}
      </button>
    </div>
  );
}

export default SeeMoreButton;
