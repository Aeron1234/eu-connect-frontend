"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import {
  internshipRecordDetailsKeys,
  internshipRecordDetailsTabOptions,
} from "@/lib/cache/internship-record-details-queries";
import DtrTable from "../dtr-ui/DtrTable";
import DtrPagination from "../dtr-ui/DtrPagination";
import RecordsNarrative from "../weekly-narratives-ui/RecordsNarratives";
import EvaluationCard from "../evaluations-ui/EvaluationCard";
import RecordsDocuments from "../internship-docs-ui/RecordsDocuments";
import RecordsSummaryReport from "../summary-reports-ui/RecordsSummaryReport";
import SetDtrLocation from "../dtr-ui/SetDtrLocation";
import TabBar from "../ui/TabBar";
import RecordsTabContentSkeleton from "../skeletons/RecordsTabContentSkeleton";
import ProgressBar from "../ui/ProgressBar";

const tabs = [
  { value: "overview", text: "Overview" },
  { value: "dtr", text: "DTR" },
  { value: "narratives", text: "Narratives" },
  { value: "summary-report", text: "Summary Report" },
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
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [activeTab, setActiveTab] = useState("overview");
  const [dtrPage, setDtrPage] = useState(1);
  const tabQuery = useQuery({
    ...internshipRecordDetailsTabOptions(
      user?.id,
      internshipId,
      activeTab,
      record,
      dtrPage,
    ),
    enabled: activeTab !== "overview" && Boolean(user?.id && internshipId),
  });

  useEffect(() => {
    if (selectedTab === activeTab) return;
    const timeout = setTimeout(() => setActiveTab(selectedTab), 300);
    return () => clearTimeout(timeout);
  }, [selectedTab, activeTab]);

  useEffect(() => {
    if (tabQuery.error) notifyReadError(tabQuery.error.message || "Could not load this section.");
  }, [tabQuery.error]);

  function handleTabClick(value) {
    setSelectedTab(value);
    if (value === "dtr") setDtrPage(1);
    if (
      value === "overview" ||
      queryClient.getQueryData(
        internshipRecordDetailsKeys.tab(user?.id, internshipId, value, 1),
      )
    ) {
      setActiveTab(value);
    }
  }

  function handleDtrLocationSaved(saved) {
    queryClient.setQueriesData(
      { queryKey: internshipRecordDetailsKeys.dtrPages(user?.id, internshipId) },
      (previous) => previous && ({
        ...previous,
        dtrLocation: {
          internship_id: saved.internship_id,
          is_custom_location: saved.is_custom_location !== false,
          location: saved,
        },
      }),
    );
  }

  const isSwitching = selectedTab !== activeTab;
  const isPending =
    isSwitching || (activeTab !== "overview" && tabQuery.isPending);
  const loadError = !isSwitching && tabQuery.isError
    ? tabQuery.error?.message || "Could not load this section."
    : "";
  const data = tabQuery.data;

  const pct = Math.min(
    100,
    Math.round((record.accumulated_hours / record.total_hours) * 100),
  );

  return (
    <>
      <TabBar tabs={tabs} selectedTab={selectedTab} onSelect={handleTabClick} />

      {loadError && !isPending ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6 text-sm">
          <p>{loadError}</p>
          <button type="button" className="mt-3 font-semibold text-primary-emphasis" onClick={() => void tabQuery.refetch()}>
            Try again
          </button>
        </div>
      ) : isPending ? (
        <RecordsTabContentSkeleton tab={selectedTab} />
      ) : (
        <>
          {activeTab === "overview" && (
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

          {activeTab === "dtr" && (
            <>
              <div className="min-w-0 rounded-xl bg-card border border-border shadow-sm p-4 sm:p-6">
                <DtrTable dtrs={data?.dtrData?.dtrs || []} />
                <DtrPagination
                  page={dtrPage}
                  totalPages={data?.dtrData?.totalPages}
                  onPageChange={setDtrPage}
                  disabled={tabQuery.isFetching}
                />
              </div>
              {record?.status === "ongoing" && (
                <div className="mt-6">
                  <SetDtrLocation
                    studentId={record?.student_id}
                    dataLocation={normalizeDtrLocation(data?.dtrLocation)}
                    onSaved={handleDtrLocationSaved}
                  />
                </div>
              )}
            </>
          )}

          {activeTab === "narratives" && (
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

          {activeTab === "evaluations" && (
            <EvaluationCard
              evaluations={data?.evaluations || []}
              onChanged={() => void queryClient.invalidateQueries({
                queryKey: internshipRecordDetailsKeys.tab(user?.id, internshipId, "evaluations"),
              })}
            />
          )}

          {activeTab === "summary-report" && (
            <RecordsSummaryReport report={data?.report || null} />
          )}

          {activeTab === "documents" && (
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
