// "use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDailyNarratives } from "../_services/actions";
import DailyNarrativeContent from "./DailyNarrativeContent";
import Link from "next/link";
import { notFound } from "next/navigation";
import Pagination from "./Pagination";

async function DailyNarrativeList({ params }) {
  const currentNarrativePage = Number(params.n_page) || 1;
  const currentDtrPage = Number(params.d_page) || 1;

  if (currentNarrativePage < 1) notFound();

  const narrativesData = await getDailyNarratives(currentNarrativePage);

  if (!narrativesData) return <div>No narratives found.</div>;

  const { narratives, totalPages } = narrativesData;

  if (totalPages > 0 && currentNarrativePage > totalPages) {
    notFound();
  }

  return (
    <>
      <ul className="flex-1 border border-stone-200 grid grid-cols-2">
        {narratives.map((narrative) => (
          <li
            className="flex flex-col gap-2 border-r border-stone-200 p-2"
            key={narrative.id}
          >
            <DailyNarrativeContent narrative={narrative} />
          </li>
        ))}
      </ul>

      <Pagination
        hrefPrev={`/student?d_page=${currentDtrPage}&n_page=${currentNarrativePage - 1}`}
        hrefNext={`/student?d_page=${currentDtrPage}&n_page=${currentNarrativePage + 1}`}
        currentPage={currentNarrativePage}
        totalPages={totalPages}
      />
    </>
  );
}

export default DailyNarrativeList;
