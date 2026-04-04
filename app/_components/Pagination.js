import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

function Pagination({ hrefPrev, hrefNext, currentPage, totalPages }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-4 font-semibold px-2">
      <Link
        href={hrefPrev}
        className={`${currentPage <= 1 ? "pointer-events-none opacity-30" : ""} rounded-full p-1 shadow-sm`}
      >
        <ChevronLeft size={16} />
      </Link>

      {/* <span>{`Page ${currentNarrativePage} out of ${totalPages}`}</span> */}
      <span>{`Page ${currentPage} / ${totalPages}`}</span>

      <Link
        href={hrefNext}
        className={`${currentPage >= totalPages ? "pointer-events-none opacity-30" : ""} rounded-full p-1 shadow-sm`}
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}

export default Pagination;
