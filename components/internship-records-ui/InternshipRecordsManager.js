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
import ManualDialog from "@/components/ui/ManualDialog";
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
  const canManageRecords = !currentRecordStatus || records.some(
    (record) => record.status === "pending" || record.status === "rejected",
  );

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

  function handleConflict() {
    void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.records(userId) });
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <PageTitle
        Icon={Briefcase}
        title="My Records"
        description="Submit your internship details and track approval status"
        titleAction={!recordsQuery.isPending && canManageRecords && (
          <ManualDialog title="How to manage your internship record">
            <div className="space-y-4 text-sm leading-relaxed text-foreground">
              <p>Submit your placement for review before you start tracking internship activities.</p>
              <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
                <li>Open the <strong>Form</strong> tab and enter your company, region, position, dates, semester, required hours, and a short description. The company website is optional.</li>
                <li>Find your company with the map search or tap the map to place its pin. Check the selected address and correct it if needed.</li>
                <li>Select <strong>Create Internship Record</strong>. Your submission appears under <strong>Records</strong> as <strong>Pending</strong> while your department head reviews it.</li>
                <li>While the record is <strong>Pending</strong>, select <strong>Edit</strong> at the bottom of the Form tab to unlock its details. Select <strong>Save changes</strong> to save, or <strong>Cancel</strong> to discard your changes. You may also delete a pending or rejected record from Records.</li>
              </ol>
              <p className="text-foreground-soft">Pending records open in view mode and can be edited until reviewed. Once approved, the record becomes ongoing and the form is locked.</p>
            </div>
          </ManualDialog>
        )}
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
    </main>
  );
}

export default InternshipRecordsManager;
