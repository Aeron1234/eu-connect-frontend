"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { activeStorageRecordOptions } from "@/lib/cache/student-storage-queries";
import { weeklyNarrativesInfiniteOptions } from "@/lib/cache/weekly-narratives-queries";
import WeeklyNarrativeContent from "@/components/weekly-narratives-ui/WeeklyNarrativeContent";
import WeeklyNarrativePostButton from "@/components/weekly-narratives-ui/WeeklyNarrativePostButton";
import WeeklyNarrativesStats from "@/components/weekly-narratives-ui/WeeklyNarrativesStats";
import PageTitle from "@/components/ui/PageTitle";
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
    return <main className="flex-1 p-4 text-sm text-muted-foreground sm:p-6 lg:p-8">Loading weekly narratives...</main>;
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
