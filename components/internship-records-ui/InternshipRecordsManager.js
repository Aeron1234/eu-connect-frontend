"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import InternshipRecordForm from "./InternshipRecordForm";
import StudentInternshipRecordList from "./StudentInternshipRecordList";
import PageTitle from "../ui/PageTitle";

function InternshipRecordsManager({
  initialRecords = [],
  regions = [],
  recordStatus = "",
}) {
  const [tab, setTab] = useState("form");
  const [deletedIds, setDeletedIds] = useState(() => new Set());
  const availableRecords = Array.isArray(initialRecords) ? initialRecords : [];
  const records = availableRecords.filter(
    (record) => !deletedIds.has(String(record.id)),
  );
  const visibleActiveRecord = records.find(
    (record) => record.status === "pending" || record.status === "ongoing",
  );
  const deletedPendingRecord = availableRecords.some(
    (record) =>
      deletedIds.has(String(record.id)) && record.status === "pending",
  );
  const currentRecordStatus =
    visibleActiveRecord?.status || (deletedPendingRecord ? "" : recordStatus);

  function handleDeleted(recordId) {
    setDeletedIds((previous) => new Set(previous).add(String(recordId)));
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

      {tab === "form" ? (
        <div className="rounded-xl border border-border bg-card shadow-sm p-5 sm:p-8">
          <InternshipRecordForm
            key={currentRecordStatus || "available"}
            regions={regions}
            recordStatus={currentRecordStatus}
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
