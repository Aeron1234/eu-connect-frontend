import WeeklyNarrativeContent from "@/app/_components/WeeklyNarrativeContent";
import WeeklyNarrativePostButton from "@/app/_components/WeeklyNarrativePostButton";
import WeeklyNarrativesStats from "@/app/_components/WeeklyNarrativesStats";
import PageTitle from "@/app/_components/PageTitle";
import { getWeeklyNarratives } from "@/app/_services/student-actions";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "Student's Narratives",
};

async function NarrativesPage() {
  const narrativesData = await getWeeklyNarratives();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageTitle
          Icon={BookOpen}
          title="Weekly Narratives"
          description="Journal your OJT learnings, activities, and reflections week by week."
        />
        <WeeklyNarrativePostButton />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <WeeklyNarrativesStats narrativeStats={narrativesData?.stats || {}} />
      </div>

      <WeeklyNarrativeContent
        narratives={narrativesData?.narratives || []}
        totalPages={narrativesData?.totalPages || 1}
        totalRecords={narrativesData?.totalRecords || 0}
      />
    </main>
  );
}

export default NarrativesPage;
