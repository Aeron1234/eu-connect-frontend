import DtrRecordsSkeleton from "./DtrRecordsSkeleton";
import SetDtrLocationSkeleton from "./SetDtrLocationSkeleton";
import NarrativesSkeleton from "./NarrativesSkeleton";
import EvaluationCriteriaSkeleton from "./EvaluationCriteriaSkeleton";
import EvaluationListSkeleton from "./EvaluationListSkeleton";
import CertificatesSkeleton from "./CertificatesSkeleton";
import ProfileInfoGridSkeleton from "./ProfileInfoGridSkeleton";

function TabContentSkeleton({ tab, userRole }) {
  if (tab === "dtr") {
    return (
      <>
        <DtrRecordsSkeleton pagination={false} />

        {["employer", "admin"].includes(userRole) && (
          <div className="mt-6">
            <SetDtrLocationSkeleton />
          </div>
        )}
      </>
    );
  }

  if (tab === "narratives") {
    return <NarrativesSkeleton />;
  }

  if (tab === "evaluations") {
    return (
      <>
        {userRole === "employer" && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-6">
            <EvaluationCriteriaSkeleton />
          </div>
        )}
        <EvaluationListSkeleton />
      </>
    );
  }

  if (tab === "certificates") {
    return <CertificatesSkeleton />;
  }

  // "info" — included for completeness, though the real manager never
  // sets isPending for this tab since info is already resolved up front.
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">
      <ProfileInfoGridSkeleton />
    </div>
  );
}

export default TabContentSkeleton;
