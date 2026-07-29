import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function Pagination({
  hrefPrev = "",
  hrefNext = "",
  currentPage,
  totalPages,
  type = "default",
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
        <Link
          href={hrefPrev}
          scroll={false}
          className={`${currentPage <= 1 ? "pointer-events-none opacity-30" : ""} rounded-full p-1`}
        >
          <ChevronLeft size={16} />
        </Link>

        {/* <span>{`Page ${currentNarrativePage} out of ${totalPages}`}</span> */}
        <span>{`Page ${currentPage} / ${totalPages}`}</span>

        {
          <Link
            href={hrefNext}
            scroll={false}
            className={`${currentPage >= totalPages ? "pointer-events-none opacity-30" : ""} rounded-full p-1`}
          >
            <ChevronRight size={16} />
          </Link>
        }
      </div>
    );
}

export default Pagination;
