"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { activeStorageRecordOptions } from "@/lib/cache/student-storage-queries";
import { weeklyNarrativesInfiniteOptions } from "@/lib/cache/weekly-narratives-queries";
import WeeklyNarrativeContent from "@/components/weekly-narratives-ui/WeeklyNarrativeContent";
import WeeklyNarrativePostButton from "@/components/weekly-narratives-ui/WeeklyNarrativePostButton";
import WeeklyNarrativesStats from "@/components/weekly-narratives-ui/WeeklyNarrativesStats";
import StudentNarrativesPageSkeleton from "@/components/skeletons/StudentNarrativesPageSkeleton";
import PageTitle from "@/components/ui/PageTitle";
import ManualDialog from "@/components/ui/ManualDialog";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

function NarrativesPage() {
  const { user } = useUser();
  const activeQuery = useQuery({
    ...activeStorageRecordOptions(user?.id),
    enabled: Boolean(user?.id),
  });
  const internship = activeQuery.data;
  const hasOngoingInternship = internship?.status === "ongoing";
  const narrativesQuery = useInfiniteQuery({
    ...weeklyNarrativesInfiniteOptions(user?.id, internship?.id),
    enabled: Boolean(user?.id && hasOngoingInternship),
  });
  const narrativesData = narrativesQuery.data?.pages[0];

  if (activeQuery.isPending || (hasOngoingInternship && narrativesQuery.isPending)) {
    return <StudentNarrativesPageSkeleton />;
  }
  if (activeQuery.isError || narrativesQuery.isError) {
    return (
      <main role="alert" className="flex-1 p-4 text-sm sm:p-6 lg:p-8">
        <p>{activeQuery.error?.message || narrativesQuery.error?.message}</p>
        <button type="button" onClick={() => {
          if (activeQuery.isError) void activeQuery.refetch();
          if (narrativesQuery.isError) void narrativesQuery.refetch();
        }} className="mt-2 font-semibold text-primary-emphasis">Try again</button>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <PageTitle
            Icon={BookOpen}
            title="Weekly Narratives"
            description="Journal your OJT learnings, activities, and reflections week by week."
            titleAction={hasOngoingInternship && (
              <ManualDialog title="How to use weekly narratives">
                <div className="space-y-4 text-sm leading-relaxed text-foreground">
                  <p>Record what you did and learned during each week of your ongoing internship.</p>
                  <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
                    <li>Select <strong>New Narrative</strong> to open the entry form.</li>
                    <li>Enter the <strong>week number</strong>, a short <strong>title</strong>, and your <strong>narrative</strong>. Describe your activities, what you learned, and any challenges or reflections. Then select <strong>Save</strong>.</li>
                    <li>Find your saved entry in the list below. On a small screen, select <strong>See more</strong> to read a long narrative in full.</li>
                    <li>Use the <strong>pencil</strong> on your entry to edit it, or the <strong>trash</strong> icon to delete it. Confirm the deletion when prompted.</li>
                  </ol>
                  <p className="text-foreground-soft">Weekly narratives are available while your internship record is ongoing.</p>
                </div>
              </ManualDialog>
            )}
          />
        </div>
        {hasOngoingInternship && (
          <div className="w-full sm:w-auto"><WeeklyNarrativePostButton /></div>
        )}
      </div>

      {hasOngoingInternship ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <WeeklyNarrativesStats narrativeStats={narrativesData?.stats || {}} />
          </div>

          <WeeklyNarrativeContent
            internshipId={internship.id}
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

export default NarrativesPage;
