"use client";

import DailyNarrativeContent from "../app/_components/DailyNarrativeContent";
import Pagination from "../app/_components/Pagination";
import { useNarratives } from "../_services/tanstack-queries";
import SpinnerBig from "../app/_components/SpinnerBig";

function DailyNarrativeList({ params, currentDtrPage, currentNarrativePage }) {
  const { data: narrativesData, isPending: isLoadingNarrative } =
    useNarratives(currentNarrativePage);

  if (isLoadingNarrative) return <SpinnerBig />;
  const narratives = narrativesData?.narratives || [];
  const totalPages = narrativesData?.totalPages || 1;

  if (narratives.length === 0) return <div>No narratives found.</div>;
  console.log(narrativesData);

  if (currentNarrativePage < 1) notFound();

  if (totalPages > 0 && currentNarrativePage > totalPages) {
    notFound();
  }

  return (
    <>
      <DailyNarrativeUl narratives={narratives} />

      <div className="flex w-full h-full items-end justify-end">
        <Pagination
          hrefPrev={`/student?d_page=${currentDtrPage}&n_page=${currentNarrativePage - 1}`}
          hrefNext={`/student?d_page=${currentDtrPage}&n_page=${currentNarrativePage + 1}`}
          currentPage={currentNarrativePage}
          totalPages={totalPages}
        />
      </div>
    </>
  );
}

function DailyNarrativeUl({ narratives }) {
  return (
    <ul className="grid grid-cols-4 flex-1 h-full gap-4 max-2xl:grid-cols-2 max-sm:grid-cols-1">
      {narratives &&
        narratives.map((narrative) => (
          <li
            className="flex flex-col gap-2 border border-stone-200 p-4 h-full rounded-md max-xs:gap-1"
            key={narrative.id}
          >
            <DailyNarrativeContent narrative={narrative} />
          </li>
        ))}
    </ul>
  );
}

export default DailyNarrativeList;
