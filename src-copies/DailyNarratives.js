import DailyNarrativePostButton from "../app/_components/DailyNarrativePostButton";
import DailyNarrativeList from "../app/_components/DailyNarrativeList";
import { getDailyNarratives } from "../app/_services/services";

function DailyNarratives({ params }) {
  return (
    <>
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-700">
          Narrative Report
        </h2>

        <DailyNarrativePostButton />
      </header>

      <DailyNarrativeList params={params} />
    </>
  );
}

export default DailyNarratives;
