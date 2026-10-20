"use client";

import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { activeStorageRecordOptions, pastStorageRecordsOptions } from "@/lib/cache/student-storage-queries";
import { weeklyNarrativesInfiniteOptions } from "@/lib/cache/weekly-narratives-queries";
import WeeklyNarrativeContent from "@/components/weekly-narratives-ui/WeeklyNarrativeContent";
import WeeklyNarrativePostButton from "@/components/weekly-narratives-ui/WeeklyNarrativePostButton";
import WeeklyNarrativesStats from "@/components/weekly-narratives-ui/WeeklyNarrativesStats";
import StudentNarrativesPageSkeleton from "@/components/skeletons/StudentNarrativesPageSkeleton";
import WeeklyNarrativesStatsSkeleton from "@/components/skeletons/WeeklyNarrativesStatsSkeleton";
import WeeklyNarrativeListSkeleton from "@/components/skeletons/WeeklyNarrativeListSkeleton";
import PageTitle from "@/components/ui/PageTitle";
import ManualDialog from "@/components/ui/ManualDialog";
import ErrorUI from "@/components/ui/ErrorUI";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WeeklyNarrativesPrintButton from "./WeeklyNarrativesPrintButton";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

function NarrativesPage() {
  const { user } = useUser();
  const [selectedId, setSelectedId] = useState("");
  const activeQuery = useQuery({
    ...activeStorageRecordOptions(user?.id),
    enabled: Boolean(user?.id),
  });
  const pastQuery = useQuery({
    ...pastStorageRecordsOptions(user?.id),
    enabled: Boolean(user?.id),
  });
  const ongoingRecord = activeQuery.data?.status === "ongoing" ? activeQuery.data : null;
  const records = [
    ...(ongoingRecord ? [ongoingRecord] : []),
    ...(pastQuery.data || []).filter((record) => record.status === "finished"),
  ];
  const internship = records.find((record) => record.id === selectedId) || records[0];
  const canEdit = Boolean(ongoingRecord && internship?.id === ongoingRecord.id);
  const narrativesQuery = useInfiniteQuery({
    ...weeklyNarrativesInfiniteOptions(user?.id, internship?.id),
    enabled: Boolean(user?.id && internship?.id),
  });
  const narrativesData = narrativesQuery.data?.pages[0];

  if (activeQuery.isPending || pastQuery.isPending) {
    return <StudentNarrativesPageSkeleton />;
  }
  if ((activeQuery.isError && activeQuery.data === undefined) ||
    (pastQuery.isError && pastQuery.data === undefined) ||
    (narrativesQuery.isError && !narrativesQuery.data)) {
    return <ErrorUI error={activeQuery.error || pastQuery.error || narrativesQuery.error} reset={() => {
      if (activeQuery.isError) void activeQuery.refetch();
      if (pastQuery.isError) void pastQuery.refetch();
      if (narrativesQuery.isError) void narrativesQuery.refetch();
    }} logError={false} />;
  }

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <PageTitle
            Icon={BookOpen}
            title="Weekly Narratives"
            description="Journal your OJT learnings, activities, and reflections week by week."
            titleAction={Boolean(internship) && (
              <ManualDialog title="How to use weekly narratives">
                <div className="space-y-4 text-sm leading-relaxed text-foreground">
                  <p>Record what you did and learned during each week of your ongoing internship.</p>
                  <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
                    <li>Choose an internship record to view its weekly narratives. Finished records can be viewed and printed.</li>
                    <li>For your ongoing internship, select <strong>New Narrative</strong> to open the entry form.</li>
                    <li>Enter the <strong>week number</strong>, a short <strong>title</strong>, and your <strong>narrative</strong>. Describe your activities, what you learned, and any challenges or reflections. Then select <strong>Save</strong>.</li>
                    <li>Find your saved entry in the list below. Entries show up to three lines. Select <strong>See more</strong> when an entry is truncated to read the full narrative.</li>
                    <li>Use the <strong>pencil</strong> on your entry to edit it, or the <strong>trash</strong> icon to delete it. Confirm the deletion when prompted.</li>
                    <li>Select <strong>Export PDF</strong> to download one PDF containing every narrative for the selected internship.</li>
                  </ol>
                  <p className="text-foreground-soft">You can add or change entries only while the internship is ongoing.</p>
                </div>
              </ManualDialog>
            )}
          />
        </div>
        {canEdit && (
          <div className="w-full sm:w-auto"><WeeklyNarrativePostButton /></div>
        )}
      </div>

      {internship ? (
        <>
          <section className="flex flex-col gap-5 rounded-xl border border-border bg-card p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between xl:gap-8">
            <div className="flex min-w-0 flex-1 flex-col gap-2 lg:flex-row lg:items-center lg:gap-7">
              <span id="narratives-internship-label" className="shrink-0 text-sm font-semibold text-foreground">Internship record</span>
              <Select value={internship.id} onValueChange={setSelectedId}>
                <SelectTrigger aria-labelledby="narratives-internship-label" className="min-h-10 w-full min-w-0 bg-canvas px-3 sm:max-w-xl">
                  <SelectValue placeholder="Choose an internship" />
                </SelectTrigger>
                <SelectContent>
                  {records.map((record) => <SelectItem key={record.id} value={record.id}>{record.company_name} - {record.status}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {Number(narrativesData?.totalRecords) > 0 && <WeeklyNarrativesPrintButton internshipId={internship.id} className="w-full sm:w-auto" />}
          </section>
          {narrativesQuery.isPending ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><WeeklyNarrativesStatsSkeleton /></div>
              <WeeklyNarrativeListSkeleton />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <WeeklyNarrativesStats narrativeStats={narrativesData?.stats || {}} />
              </div>
              <WeeklyNarrativeContent
                key={internship.id}
                internshipId={internship.id}
                showActions={canEdit}
              />
            </>
          )}
        </>
      ) : (
        <section className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center sm:px-8 sm:py-16">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary-emphasis">
            <BookOpen className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No eligible internship record
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your ongoing or finished internship records will appear here. You can submit narratives while a record is ongoing.
          </p>
          <Link
            href="/student/internship-record"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-emphasis hover:underline"
          >
            View my records <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      )}
    </div>
  );
}

export default NarrativesPage;
