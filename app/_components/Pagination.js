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
        className={`flex justify-center w-full rounded-sm px-4 py-1 tracking-wide font-bold hover:bg-stone-200 transition-colors`}
      >
        See more
      </Link>
    );

  if (type === "default")
    return (
      <div className="flex items-center gap-4 font-semibold text-stone-500">
        {onPrev ? (
          <button onClick={onPrev} disabled={currentPage <= 1} className="...">
            <ChevronLeft size={16} />
          </button>
        ) : (
          <Link
            href={hrefPrev}
            scroll={false}
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
            className="..."
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <Link
            href={hrefNext}
            scroll={false}
            className={`${currentPage >= totalPages ? "pointer-events-none opacity-30" : ""} rounded-full p-1`}
          >
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
    );
}

export default Pagination;
