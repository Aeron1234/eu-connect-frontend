"use client";

import { useState } from "react";
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
  const visibleActiveRecord = records.find(
    (record) => record.status === "pending" || record.status === "ongoing",
  );
  const currentRecordStatus = visibleActiveRecord?.status || recordsQuery.data?.active?.status || "";

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

  function handleCreated() {
    queryClient.setQueryData(studentRecordsKeys.records(userId), (previous) =>
      previous ? { ...previous, active: { status: "pending" } } : previous,
    );
    void queryClient.invalidateQueries({ queryKey: studentRecordsKeys.records(userId) });
    void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(userId, "student") });
    void queryClient.invalidateQueries({ queryKey: studentStorageKeys.active(userId) });
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <PageTitle
        Icon={Briefcase}
        title={"My Records"}
        description={"Submit your internship details and track approval status"}
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
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Loading internship records...
        </div>
      ) : (recordsQuery.isError || regionsQuery.isError) ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-5 text-sm">
          <p>{recordsQuery.error?.message || regionsQuery.error?.message}</p>
          <button type="button" className="mt-3 font-semibold text-primary-emphasis" onClick={() => {
            if (recordsQuery.isError) void recordsQuery.refetch();
            if (regionsQuery.isError) void regionsQuery.refetch();
          }}>Try again</button>
        </div>
      ) : tab === "form" ? (
        <div className="rounded-xl border border-border bg-card shadow-sm p-5 sm:p-8">
          <InternshipRecordForm
            key={currentRecordStatus || "available"}
            regions={regions}
            recordStatus={currentRecordStatus}
            onCreated={handleCreated}
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
