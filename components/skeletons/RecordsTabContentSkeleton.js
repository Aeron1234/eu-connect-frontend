import CompanyRotationsSkeleton from "./CompanyRotationsSkeleton";
import SetDtrLocationSkeleton from "./SetDtrLocationSkeleton";
import EvaluationListSkeleton from "./EvaluationListSkeleton";
import RecordsDocumentsSkeleton from "./RecordsDocumentsSkeleton";
import RecordsOverviewSkeleton from "./RecordsOverviewSkeleton";
import DtrRecordsSkeleton from "./DtrRecordsSkeleton";
import NarrativesSkeleton from "./NarrativesSkeleton";
import RecordsSummaryReportSkeleton from "./RecordsSummaryReportSkeleton";

function RecordsTabContentSkeleton({ tab }) {
  if (tab === "rotations") return <CompanyRotationsSkeleton readOnly />;

  if (tab === "overview") {
    return <RecordsOverviewSkeleton />;
  }

  if (tab === "dtr") {
    return (
      <>
        <DtrRecordsSkeleton />

        <div className="mt-6">
          <SetDtrLocationSkeleton />
        </div>
      </>
    );
  }

  if (tab === "narratives") {
    return <NarrativesSkeleton rows={4} />;
  }

  if (tab === "evaluations") {
    return <EvaluationListSkeleton />;
  }

  if (tab === "summary-report") {
    return <RecordsSummaryReportSkeleton />;
  }

  // documents
  return <RecordsDocumentsSkeleton />;
}

export default RecordsTabContentSkeleton;
