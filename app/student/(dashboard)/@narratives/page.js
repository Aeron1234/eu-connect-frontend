import DailyNarrativeContent from "@/app/_components/DailyNarrativeContent";
import DailyNarrativeList from "@/app/_components/DailyNarrativeList";
import DailyNarrativePostButton from "@/app/_components/DailyNarrativePostButton";
import Pagination from "@/app/_components/Pagination";
import { getDailyNarratives } from "@/app/_services/actions";

async function DailyNarrativePage({ searchParams }) {
  const params = await searchParams;
  // return <DailyNarratives params={params} />;

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
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-700">
          Narrative Report
        </h2>

        <DailyNarrativePostButton />
      </header>

      {/* <DailyNarrativeList
        // narratives={narratives} totalPages={totalPages}
        params={params}
      /> */}

      <ul className="border border-stone-200 grid grid-cols-2">
        {narratives.map((narrative) => (
          <li
            className="flex flex-col gap-2 border-r border-stone-200 p-2"
            key={narrative.id}
          >
            <DailyNarrativeContent narrative={narrative} />
          </li>
        ))}
      </ul>

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

export default DailyNarrativePage;
