import { withReadErrorPage } from "@/lib/page-read-error";
import WeeklyNarrativeContent from "@/components/weekly-narratives-ui/WeeklyNarrativeContent";
import WeeklyNarrativePostButton from "@/components/weekly-narratives-ui/WeeklyNarrativePostButton";
import WeeklyNarrativesStats from "@/components/weekly-narratives-ui/WeeklyNarrativesStats";
import PageTitle from "@/components/ui/PageTitle";
import { getWeeklyNarratives } from "@/lib/server-actions/weekly-narratives-actions";
import { getOngoingInternshipRecord } from "@/lib/server-actions/internship-records-actions";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Student's Narratives",
};

export const dynamic = "force-dynamic";

async function NarrativesPage() {
  const internship = await getOngoingInternshipRecord();
  const hasOngoingInternship = internship?.status === "ongoing";
  const narrativesData = hasOngoingInternship ? await getWeeklyNarratives() : null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageTitle
          Icon={BookOpen}
          title="Weekly Narratives"
          description="Journal your OJT learnings, activities, and reflections week by week."
        />
        {hasOngoingInternship && <WeeklyNarrativePostButton />}
      </div>

      {hasOngoingInternship ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <WeeklyNarrativesStats narrativeStats={narrativesData?.stats || {}} />
          </div>

          <WeeklyNarrativeContent
            narratives={narrativesData?.narratives || []}
            totalPages={narrativesData?.totalPages || 1}
            totalRecords={narrativesData?.totalRecords || 0}
          />
        </>
      ) : (
        <section className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center sm:px-8 sm:py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-emphasis">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No ongoing internship record
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Weekly narratives are available once your internship record is approved and ongoing. You cannot submit narratives yet.
          </p>
          <Link
            href="/student/internship-record"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-emphasis hover:underline"
          >
            View my records <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      )}
    </main>
  );
}

export default withReadErrorPage(NarrativesPage);
