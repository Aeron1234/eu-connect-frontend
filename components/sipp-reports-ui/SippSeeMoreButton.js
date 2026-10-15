"use client";

export default function SippSeeMoreButton({
  isPending, query, onSeeMore, className = "text-center",
}) {
  return (
    !isPending && query.hasNextPage && (
      <div className={className}>
        <button
          onClick={onSeeMore}
          disabled={query.isFetchingNextPage}
          className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition-colors"
        >
          {query.isFetchingNextPage ? "Loading..." : "See more"}
        </button>
      </div>
    )
  );
}
