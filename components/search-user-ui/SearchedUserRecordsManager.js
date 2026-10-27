"use client";

import CompanyRotations from "../internship-records-ui/CompanyRotations";
import ErrorUI from "@/components/ui/ErrorUI";
import SearchedUserFilter from "./SearchedUserFilter";
import StudentNarratives from "../weekly-narratives-ui/StudentNarratives";
import EmployerCertificateUploads from "../internship-docs-ui/EmployerCertificateUploads";
import ProfileInfoGrid from "./ProfileInfoGrid";
import TabContentSkeleton from "../skeletons/TabContentSkeleton";
import ProfileDtrTab from "./ProfileDtrTab";
import ProfileEvaluationsTab from "./ProfileEvaluationsTab";
import useSearchedUserTabs from "./useSearchedUserTabs";

function SearchedUserRecordsManager({
  searchedUserId,
  userId,
  userRole,
  searchedUserRole,
  hasOngoingInternship,
  canViewStudentRecords,
  info,
  defaultFilter,
  initialDtrData,
  initialDtrLocation,
  supervision,
}) {
  const {
    tabs, hideTabs, selectedTab, activeTab, dtrPage, setDtrPage,
    tabQuery, data, isPending, loadError, handleTabClick,
    handleDtrLocationSaved, refreshEvaluations, refreshCertificates,
  } = useSearchedUserTabs({
    searchedUserId, userId, userRole, searchedUserRole, hasOngoingInternship,
    defaultFilter, initialDtrData, initialDtrLocation, supervision, canViewStudentRecords,
  });

  return (
    <>
      {!hideTabs && (
        <SearchedUserFilter
          tabs={tabs}
          selectedTab={selectedTab}
          onSelect={handleTabClick}
        />
      )}

      <div className={hideTabs ? "" : "mt-6"}>
        {!isPending && tabQuery.isError && tabQuery.data && (
          <ErrorUI error={tabQuery.error} reset={() => void tabQuery.refetch()} compact logError={false} />
        )}
        {loadError && !isPending ? (
          <ErrorUI error={tabQuery.error} reset={() => void tabQuery.refetch()} logError={false} />
        ) : isPending ? (
          <TabContentSkeleton tab={selectedTab} userRole={userRole} />
        ) : (
          <>
            {activeTab === "dtr" && (
              <ProfileDtrTab
                data={data}
                dtrPage={dtrPage}
                setDtrPage={setDtrPage}
                tabQuery={tabQuery}
                userRole={userRole}
                searchedUserId={searchedUserId}
                handleDtrLocationSaved={handleDtrLocationSaved}
              />
            )}

            {activeTab === "narratives" && (
              <StudentNarratives
                initialPage={data?.narrativeData}
                searchedUserId={searchedUserId}
                viewerId={userId}
              />
            )}

            {activeTab === "evaluations" && (
              <ProfileEvaluationsTab
                userRole={userRole}
                searchedUserId={searchedUserId}
                dateStarted={info?.internship_date_started}
                data={data}
                refreshEvaluations={refreshEvaluations}
              />
            )}

            {activeTab === "certificates" && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">
                <EmployerCertificateUploads
                  searchedUserId={searchedUserId}
                  uploadedFiles={data?.uploadedFiles}
                  onChanged={refreshCertificates}
                />
              </div>
            )}

            {activeTab === "info" && (
              <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6">
                <ProfileInfoGrid info={info} />
                {info?.internship_id && <div className="mt-4"><CompanyRotations internshipId={info.internship_id} readOnly compact /></div>}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default SearchedUserRecordsManager;
