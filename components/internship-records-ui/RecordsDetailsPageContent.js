"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import EvaluationCard from "../evaluations-ui/EvaluationCard";
import RecordsDocuments from "../internship-docs-ui/RecordsDocuments";
import RecordsSummaryReport from "../summary-reports-ui/RecordsSummaryReport";
import TabBar from "../ui/TabBar";
import RecordsTabContentSkeleton from "../skeletons/RecordsTabContentSkeleton";
import RecordOverviewTab from "./RecordOverviewTab";
import RecordDtrTab from "./RecordDtrTab";
import RecordNarrativesTab from "./RecordNarrativesTab";
import useRecordDetailsTabs from "./useRecordDetailsTabs";

const tabs = [
  { value: "overview", text: "Overview" },
  { value: "dtr", text: "DTR" },
  { value: "narratives", text: "Narratives" },
  { value: "summary-report", text: "Summary Report" },
  { value: "evaluations", text: "Evaluations" },
  { value: "documents", text: "Documents" },
];

function RecordsDetailsPageContent({ record, internshipId }) {
  const {
    selectedTab, activeTab, dtrPage, setDtrPage, tabQuery,
    data, isPending, loadError, handleTabClick,
    handleDtrLocationSaved, refreshEvaluations,
  } = useRecordDetailsTabs(record, internshipId);

  return (
    <>
      <TabBar tabs={tabs} selectedTab={selectedTab} onSelect={handleTabClick} />

      {!isPending && tabQuery.isError && tabQuery.data && (
        <ErrorUI error={tabQuery.error} reset={() => void tabQuery.refetch()} compact logError={false} />
      )}

      {loadError && !isPending ? (
        <ErrorUI error={tabQuery.error} reset={() => void tabQuery.refetch()} logError={false} />
      ) : isPending ? (
        <RecordsTabContentSkeleton tab={selectedTab} />
      ) : (
        <>
          {activeTab === "overview" && (
            <RecordOverviewTab record={record} internshipId={internshipId} />
          )}

          {activeTab === "dtr" && (
            <RecordDtrTab
              record={record}
              data={data}
              dtrPage={dtrPage}
              setDtrPage={setDtrPage}
              tabQuery={tabQuery}
              handleDtrLocationSaved={handleDtrLocationSaved}
            />
          )}

          {activeTab === "narratives" && (
            <RecordNarrativesTab data={data} />
          )}

          {activeTab === "evaluations" && (
            <EvaluationCard
              evaluations={data?.evaluations || []}
              onChanged={refreshEvaluations}
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

export default RecordsDetailsPageContent;
