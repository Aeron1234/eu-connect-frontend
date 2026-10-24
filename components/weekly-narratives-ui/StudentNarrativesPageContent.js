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
import HelpManual from "@/components/help-ui/HelpManual";
import ErrorUI from "@/components/ui/ErrorUI";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WeeklyNarrativesPrintButton from "./WeeklyNarrativesPrintButton";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import useInternshipStartAccess from "@/components/ui/useInternshipStartAccess";
import InternshipStartNotice from "@/components/ui/InternshipStartNotice";

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
  const canManage = Boolean(ongoingRecord && internship?.id === ongoingRecord.id);
  const startAccess = useInternshipStartAccess(internship?.date_started, "Weekly narratives");
  const canEdit = canManage && startAccess.allowed;
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
            titleAction={<HelpManual guideId="narratives" title="How to use weekly narratives" />}
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
          {canManage && !startAccess.allowed && <InternshipStartNotice message={startAccess.message} />}
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
                showActions={canManage}
                canEdit={canEdit}
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
