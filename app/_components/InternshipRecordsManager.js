"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";
import InternshipRecordForm from "./InternshipRecordForm";
import StudentInternshipRecordList from "./StudentInternshipRecordList";
import PageTitle from "./PageTitle";

function InternshipRecordsManager({
  initialRecords = [],
  regions = [],
  recordStatus = "",
}) {
  const [tab, setTab] = useState("form");

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <PageTitle
        Icon={Briefcase}
        title={"My Records"}
        description={"Submit your internship details and track approval status"}
      />

      <div className="flex gap-1 rounded-lg p-1 bg-stone-200 w-fit">
        <button
          type="button"
          onClick={() => setTab("form")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "form"
              ? "bg-primary-500 text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-primary-500"
          }`}
        >
          Form
        </button>
        <button
          type="button"
          onClick={() => setTab("records")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors flex gap-1 ${
            tab === "records"
              ? "bg-primary-500 text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-primary-500"
          }`}
        >
          Records
          {initialRecords.length > 0 && (
            <span
              className={`rounded-full ${
                tab === "records"
                  ? "bg-stone-100 text-primary-500"
                  : "text-stone-600"
              } px-2 py-0.5 text-xs font-semibold`}
            >
              {initialRecords.length}
            </span>
          )}
        </button>
      </div>

      {tab === "form" ? (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm p-5 sm:p-8">
          <InternshipRecordForm regions={regions} recordStatus={recordStatus} />
        </div>
      ) : (
        <StudentInternshipRecordList userInternshipData={initialRecords} />
      )}
    </main>
  );
}

export default InternshipRecordsManager;
