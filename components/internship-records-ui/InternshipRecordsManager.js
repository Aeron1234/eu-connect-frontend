"use client";

import { useState } from "react";
import ErrorUI from "@/components/ui/ErrorUI";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import {
  regionsOptions,
  studentRecordsKeys,
  studentRecordsOptions,
} from "@/lib/cache/student-records-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { studentStorageKeys } from "@/lib/cache/student-storage-queries";
import { Briefcase } from "lucide-react";
import InternshipRecordForm from "./InternshipRecordForm";
import StudentInternshipRecordList from "./StudentInternshipRecordList";
import PageTitle from "../ui/PageTitle";
import InternshipRecordFormSkeleton from "@/components/skeletons/InternshipRecordFormSkeleton";
import RecordCardSkeleton from "@/components/skeletons/RecordCardSkeleton";
import HelpManual from "@/components/help-ui/HelpManual";
import { getCurrentInternshipRecord } from "./internshipRecordFormData.mjs";
import { calendarKeys } from "@/lib/cache/calendar-queries";

function InternshipRecordsManager() {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const recordsQuery = useQuery({
    ...studentRecordsOptions(userId),
    enabled: Boolean(userId),
  });
  const regionsQuery = useQuery({
    ...regionsOptions(),
    enabled: Boolean(userId),
  });
  const [tab, setTab] = useState("form");
  const records = recordsQuery.data?.records || [];
  const regions = regionsQuery.data || [];
  const activeRecord = getCurrentInternshipRecord(records, recordsQuery.data?.active);
  const currentRecordStatus = activeRecord?.status || "";

  function handleDeleted(recordId) {
    queryClient.setQueryData(studentRecordsKeys.records(userId), (previous) =>
      previous
        ? {
            ...previous,
            records: previous.records.filter((record) => String(record.id) !== String(recordId)),
            active: previous.records.find((record) => String(record.id) === String(recordId))?.status === "pending"
              ? null
              : previous.active,
          }
        : previous,
    );
    void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.records(userId) });
    void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(userId, "student") });
    void queryClient.invalidateQueries({ queryKey: studentStorageKeys.active(userId) });
  }

  // Shared by successful creation and pending edits: update the active snapshot,
  // then refetch to obtain canonical fields/IDs and refresh dependent student views.
  function handleCreated(submittedRecord) {
    queryClient.setQueryData(studentRecordsKeys.records(userId), (previous) =>
      previous ? {
        ...previous,
        active: { ...submittedRecord, status: "pending" },
        records: previous.records.map((record) => submittedRecord.id != null && String(record.id) === String(submittedRecord.id) ? { ...record, ...submittedRecord } : record),
      } : previous,
    );
    void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.records(userId) });
    void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(userId, "student") });
    void queryClient.invalidateQueries({ queryKey: studentStorageKeys.active(userId) });
    void queryClient.invalidateQueries({ queryKey: calendarKeys.all(userId) });
  }

  // A save conflict can mean staff already processed the pending record.
  // Reload current status so the form's eligibility is recalculated.
  function handleConflict() {
    void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.records(userId) });
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <PageTitle
        Icon={Briefcase}
        title="My Records"
        description="Submit your internship details and track approval status"
        titleAction={<HelpManual guideId="student-record" title="How to manage your internship record" />}
      />

      <div className="flex gap-1 rounded-lg p-1 bg-secondary w-fit">
        <button
          type="button"
          onClick={() => setTab("form")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "form"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-primary-emphasis"
          }`}
        >
          Form
        </button>
        <button
          type="button"
          onClick={() => setTab("records")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors flex gap-1 ${
            tab === "records"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-primary-emphasis"
          }`}
        >
          Records
          {records.length > 0 && (
            <span
              className={`rounded-full ${
                tab === "records"
                  ? "bg-muted text-primary-emphasis"
                  : "text-foreground-soft"
              } px-2 py-0.5 text-xs font-semibold`}
            >
              {records.length}
            </span>
          )}
        </button>
      </div>

      {(recordsQuery.isPending || regionsQuery.isPending) ? (
        tab === "form" ? (
          <div className="min-w-0" role="status" aria-label="Loading internship records">
            <InternshipRecordFormSkeleton />
          </div>
        ) : (
          <div className="space-y-3" role="status" aria-label="Loading internship records">
            {Array.from({ length: 3 }, (_, index) => <RecordCardSkeleton key={index} />)}
          </div>
        )
      ) : ((recordsQuery.isError && recordsQuery.data === undefined) ||
        (regionsQuery.isError && regionsQuery.data === undefined)) ? (
        <ErrorUI error={recordsQuery.isError && recordsQuery.data === undefined ? recordsQuery.error : regionsQuery.error} logError={false} reset={() => {
            if (recordsQuery.isError) void recordsQuery.refetch();
            if (regionsQuery.isError) void regionsQuery.refetch();
          }} />
      ) : tab === "form" ? (
        <div className="min-w-0">
          <InternshipRecordForm
            key={activeRecord?.id || currentRecordStatus || "available"}
            regions={regions}
            recordStatus={currentRecordStatus}
            activeRecord={activeRecord}
            onCreated={handleCreated}
            onUpdated={handleCreated}
            onConflict={handleConflict}
          />
        </div>
      ) : (
        <StudentInternshipRecordList
          userInternshipData={records}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}

export default InternshipRecordsManager;
