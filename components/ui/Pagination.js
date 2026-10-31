import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function Pagination({
  hrefPrev = "",
  hrefNext = "",
  currentPage,
  totalPages,
  type = "default",
  onPrev,
  onNext,
}) {
  if (totalPages <= 1) return null;

  if (type === "seeMore" && currentPage < totalPages)
    return (
      <Link
        href={hrefNext}
        scroll={false}
        className={`flex justify-center w-full rounded-sm px-4 py-1 tracking-wide font-bold hover:bg-secondary transition-colors`}
        prefetch={true}
      >
        See more
      </Link>
    );

  if (type === "default")
    return (
      <div className="flex items-center gap-4 font-semibold text-muted-foreground">
        {onPrev ? (
          <button type="button" onClick={onPrev} disabled={currentPage <= 1} aria-label="Previous page" className="grid size-9 place-items-center rounded-md hover:bg-muted disabled:opacity-40">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
        ) : (
          <Link
            href={hrefPrev}
            scroll={false}
            aria-label="Previous page"
            className={`${currentPage <= 1 ? "pointer-events-none opacity-30" : ""} rounded-full p-1`}
          >
            <ChevronLeft size={16} />
          </Link>
        )}
        <span>{`Page ${currentPage} / ${totalPages}`}</span>
        {onNext ? (
          <button
            onClick={onNext}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            type="button"
            className="grid size-9 place-items-center rounded-md hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        ) : (
          <Link
            href={hrefNext}
            scroll={false}
            aria-label="Next page"
            className={`${currentPage >= totalPages ? "pointer-events-none opacity-30" : ""} rounded-full p-1`}
          >
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
    );
}

export default Pagination;
