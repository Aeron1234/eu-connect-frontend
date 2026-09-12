import DailyNarrativeContent from "@/app/_components/DailyNarrativeContent";
import DailyNarrativePostButton from "@/app/_components/DailyNarrativePostButton";
import DailyNarrativesStats from "@/app/_components/DailyNarrativesStats";
import PageTitle from "@/app/_components/PageTitle";
import { getDailyNarratives } from "@/app/_services/student-actions";
import { BookOpen } from "lucide-react";

export const metadata = {
  title: "Student's Narratives",
};

async function NarrativesPage({ searchParams }) {
  const params = await searchParams;
  const currentNarrativePage = Number(params?.page) || 1;
  const narrativesData = await getDailyNarratives();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <PageTitle
            Icon={BookOpen}
            title={"Daily Narratives"}
            description={
              "Journal your OJT learnings, activities, and reflections day by day."
            }
          />

          <DailyNarrativePostButton />
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DailyNarrativesStats narrativeStats={narrativesData?.stats || {}} />
        </div>

        {/* Timeline */}
        <div className="relative">
          <DailyNarrativeContent
            narratives={narrativesData?.narratives || []}
            totalPages={narrativesData?.totalPages || 1}
            totalRecords={narrativesData?.totalRecords || 0}
          />
        </div>
      </div>
    </main>
  );
}

export default NarrativesPage;
