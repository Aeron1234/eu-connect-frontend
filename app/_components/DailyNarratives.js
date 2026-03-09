import DailyNarrativePostButton from "./DailyNarrativePostButton";
import DailyNarrativeList from "./DailyNarrativeList";
import { getDailyNarratives } from "../_services/services";

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
