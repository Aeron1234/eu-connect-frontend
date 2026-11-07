"use client";

import CompanyRotations from "./CompanyRotations";
import useInternshipRotations from "@/lib/hooks/useInternshipRotations";
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

const submissionTabs = [
  { value: "narratives", text: "Narratives" },
  { value: "summary-report", text: "Summary Report" },
  { value: "documents", text: "Documents" },
];

function RecordsDetailsPageContent({ record, internshipId, initialTab = "overview", initialEvaluationId = null, mode = "records" }) {
  const {
    selectedTab, activeTab, dtrPage, setDtrPage, tabQuery,
    data, isPending, loadError, handleTabClick,
    handleDtrLocationSaved, refreshEvaluations,
  } = useRecordDetailsTabs(record, internshipId, initialTab);

  const rotations = useInternshipRotations(internshipId, mode === "records");
  const visibleTabs = mode === "records"
    ? [{ value: "overview", text: "Overview" }, ...(rotations.data?.enabled || rotations.data?.rotations?.length ? [{ value: "rotations", text: "Rotations" }] : [])]
    : mode === "submissions" ? submissionTabs : [];
  return (
    <>
      {visibleTabs.length > 0 && <TabBar tabs={visibleTabs} selectedTab={selectedTab} onSelect={handleTabClick} />}

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

          {activeTab === "rotations" && <CompanyRotations internshipId={internshipId} readOnly />}
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
              focusId={initialEvaluationId}
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
