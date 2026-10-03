"use client";

import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";
import RecordsDtrTable from "../dtr-ui/RecordsDtrTable";
import RecordsNarrative from "../weekly-narratives-ui/RecordsNarratives";
import EvaluationCard from "../evaluations-ui/EvaluationCard";
import RecordsDocuments from "../internship-docs-ui/RecordsDocuments";
import SetDtrLocation from "../dtr-ui/SetDtrLocation";
import TabBar from "../ui/TabBar";
import RecordsTabContentSkeleton from "../skeletons/RecordsTabContentSkeleton";
import ProgressBar from "../ui/ProgressBar";
import { getInternshipRecordDocuments } from "@/lib/server-actions/internship-docs-actions";
import {
  getInternshipRecordDtr,
  getSearchedStudentDtrLocation,
} from "@/lib/server-actions/dtr-actions";
import { getInternshipRecordWeeklyNarratives } from "@/lib/server-actions/weekly-narratives-actions";
import { getInternshipRecordEvaluations } from "@/lib/server-actions/evaluations-actions";

import { getFileRequirementTypes } from "@/lib/server-actions/internship-docs-actions";

const tabs = [
  { value: "overview", text: "Overview" },
  { value: "dtr", text: "DTR" },
  { value: "narratives", text: "Narratives" },
  { value: "evaluations", text: "Evaluations" },
  { value: "documents", text: "Documents" },
];

function normalizeDtrLocation(raw) {
  const r = raw || {};
  return {
    internship_id: r?.internship_id,
    is_custom_location: r?.is_custom_location || false,
    location: {
      lat: r?.location?.lat,
      lon: r?.location?.lon,
      radius_meters: r?.location?.radius_meters,
      label: r?.location?.label,
      address: r?.location?.address || null,
      set_by: r?.location?.set_by || null,
      created_at: r?.location?.created_at || null,
      updated_at: r?.location?.updated_at || null,
    },
  };
}

function RecordsDetailsPageContent({ record, internshipId }) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [filter, setFilter] = useState("overview");
  const [data, setData] = useState({});
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  // Overview's data is already on hand via `record` — switching to it
  // never needs a fetch.
  const fetchers = {
    dtr: async () => {
      const [dtrs, dtrLocation] = await Promise.all([
        getInternshipRecordDtr(internshipId),
        getSearchedStudentDtrLocation(record?.student_id),
      ]);
      return { dtrs, dtrLocation };
    },
    narratives: async () => {
      const narratives =
        await getInternshipRecordWeeklyNarratives(internshipId);
      return { narratives };
    },
    evaluations: async () => {
      const evaluations = await getInternshipRecordEvaluations(internshipId);
      return { evaluations };
    },
    documents: async () => {
      const [fileData, requirementTypes] = await Promise.all([
        getInternshipRecordDocuments(internshipId),
        getFileRequirementTypes(),
      ]);
      return { fileData, requirementTypes };
    },
  };

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (selectedTab === filter) return;

    if (selectedTab === "overview") {
      setFilter("overview");
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const result = await fetchers[selectedTab]();

        if (thisRequestId !== requestIdRef.current) return;

        setFilter(selectedTab);
        setData(result);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading record tab:", error);
          setFilter(selectedTab);
          setData({});
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedTab, filter]);

  const pct = Math.min(
    100,
    Math.round((record.accumulated_hours / record.total_hours) * 100),
  );

  return (
    <>
      <TabBar tabs={tabs} selectedTab={selectedTab} onSelect={setSelectedTab} />

      {isPending ? (
        <RecordsTabContentSkeleton tab={selectedTab} />
      ) : (
        <>
          {filter === "overview" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border shadow-sm bg-card p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-primary-emphasis">
                  Internship Details
                </h3>
                <dl className="mt-3 space-y-2 text-sm">
                  {[
                    ["Company", record.company_name],
                    [
                      "Supervisor",
                      `${record.supervisor_name ? record.supervisor_name : "–"}`,
                    ],
                    [
                      "Duration",
                      record.status === "ongoing"
                        ? `${format(new Date(record.date_started), "MMMM-dd-yyyy")} – ${record.status === "ongoing" ? "still ongoing" : ` ${format(new Date(record.date_ended), "MMMM-dd-yyyy")}`}`
                        : "–",
                    ],
                    [
                      "Submitted",
                      `${format(new Date(record.created_at), "MMMM-dd-yyyy")}`,
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-right font-medium text-foreground">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="rounded-xl border border-border shadow-sm bg-card p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-bold text-primary-emphasis">
                  Hours Rendered
                </h3>
                <p className="mt-3 text-2xl sm:text-3xl font-bold text-primary-emphasis">
                  {record.accumulated_hours.toFixed(1)}
                  <span className="text-sm sm:text-base font-normal text-muted-foreground">
                    /{record.total_hours} hrs
                  </span>
                </p>
                <ProgressBar
                  value={pct}
                  label="Required internship hours completed"
                  className="mt-3"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {pct}% of required hours completed
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-center text-xs">
                  <Stat label="DTR entries" value={record.dtr_count} />
                  <Stat label="Narratives" value={record.narrative_count} />
                  <Stat label="Documents" value={record.document_count} />
                </div>
              </div>
            </div>
          )}

          {filter === "dtr" && (
            <>
              <div className="rounded-xl bg-card border border-border shadow-sm p-4 sm:p-6">
                <RecordsDtrTable dtrs={data?.dtrs || []} />
              </div>
              <div className="mt-6">
                <SetDtrLocation
                  studentId={record?.student_id}
                  dataLocation={normalizeDtrLocation(data?.dtrLocation)}
                />
              </div>
            </>
          )}

          {filter === "narratives" && (
            <ul className="space-y-3 sm:space-y-4">
              {(data?.narratives || []).map((narrative) => (
                <RecordsNarrative
                  key={`${narrative.id}-${narrative.updated_at || narrative.created_at}`}
                  narrative={narrative}
                />
              ))}

              {(!data?.narratives || data.narratives.length === 0) && (
                <li className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
                  <p className="text-sm text-muted-foreground">
                    No narratives yet.
                  </p>
                </li>
              )}
            </ul>
          )}

          {filter === "evaluations" && (
            <EvaluationCard evaluations={data?.evaluations || []} />
          )}

          {filter === "documents" && (
            <RecordsDocuments
              fileData={data?.fileData || []}
              requirementTypes={data?.requirementTypes || []}
              internshipId={internshipId}
            />
          )}
        </>
      )}
    </>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-muted py-2">
      <p className="text-base sm:text-lg font-bold text-primary-emphasis">
        {value}
      </p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}

export default RecordsDetailsPageContent;
