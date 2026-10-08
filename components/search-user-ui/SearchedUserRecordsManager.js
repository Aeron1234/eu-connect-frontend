"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { evaluationsKeys } from "@/lib/cache/evaluations-queries";
import {
  userProfileKeys,
  userProfileTabOptions,
} from "@/lib/cache/user-profile-queries";
import SearchedUserFilter from "./SearchedUserFilter";
import DtrTable from "../dtr-ui/DtrTable";
import DtrPagination from "../dtr-ui/DtrPagination";
import SetDtrLocation from "../dtr-ui/SetDtrLocation";
import StudentNarratives from "../weekly-narratives-ui/StudentNarratives";
import StudentEvaluationList from "../evaluations-ui/StudentEvaluationList";
import StudentEvaluationCriteria from "../evaluations-ui/StudentEvaluationCriteria";
import EmployerCertificateUploads from "../internship-docs-ui/EmployerCertificateUploads";
import ProfileInfoGrid from "./ProfileInfoGrid";
import TabContentSkeleton from "../skeletons/TabContentSkeleton";

function buildTabs({ userRole, searchedUserRole, supervision, hasOngoingInternship }) {
  if (searchedUserRole !== "student") {
    return [{ value: "info", text: "Info" }];
  }
  if (!hasOngoingInternship) {
    return [{ value: "info", text: "Info" }];
  }
  if (userRole === "student") {
    return [{ value: "info", text: "Info" }];
  }
  if (userRole === "employer") {
    if (supervision?.status !== "accepted") {
      return [{ value: "info", text: "Info" }];
    }
    return [
      { value: "dtr", text: "DTR" },
      { value: "narratives", text: "Narratives" },
      { value: "evaluations", text: "Evaluations" },
      { value: "certificates", text: "Certificates" },
      { value: "info", text: "Info" },
    ];
  }
  return [
    { value: "dtr", text: "DTR" },
    { value: "narratives", text: "Narratives" },
    { value: "evaluations", text: "Evaluations" },
    { value: "info", text: "Info" },
  ];
}

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

function SearchedUserRecordsManager({
  searchedUserId,
  userId,
  userRole,
  searchedUserRole,
  hasOngoingInternship,
  info,
  defaultFilter,
  initialDtrData,
  initialDtrLocation,
  supervision,
}) {
  const tabs = buildTabs({ userRole, searchedUserRole, supervision, hasOngoingInternship });
  const hideTabs = searchedUserRole === "student" && !hasOngoingInternship;

  const safeDefaultFilter = tabs.some((tab) => tab.value === defaultFilter)
    ? defaultFilter
    : "info";

  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(safeDefaultFilter);
  const [activeTab, setActiveTab] = useState(safeDefaultFilter);
  const [dtrPage, setDtrPage] = useState(1);
  const tabQuery = useQuery({
    ...userProfileTabOptions(
      userId,
      searchedUserId,
      activeTab,
      dtrPage,
      userRole,
    ),
    enabled: activeTab !== "info" && Boolean(userId && searchedUserId),
    initialData:
      activeTab === "dtr" && dtrPage === 1 && initialDtrData
        ? { dtrData: initialDtrData, dtrLocation: initialDtrLocation }
        : undefined,
  });

  useEffect(() => {
    if (selectedTab === activeTab) return;
    const timeout = setTimeout(() => setActiveTab(selectedTab), 300);
    return () => clearTimeout(timeout);
  }, [selectedTab, activeTab]);

  useEffect(() => {
    if (tabQuery.error) {
      notifyReadError(tabQuery.error.message || "Could not load this section.");
    }
  }, [tabQuery.error]);

  useEffect(() => {
    if (!userId || !initialDtrData) return;
    queryClient.setQueryData(
      userProfileKeys.tab(userId, searchedUserId, "dtr", 1),
      { dtrData: initialDtrData, dtrLocation: initialDtrLocation },
    );
  }, [
    initialDtrData,
    initialDtrLocation,
    queryClient,
    searchedUserId,
    userId,
  ]);

  function handleTabClick(value) {
    setSelectedTab(value);
    const page = value === "dtr" ? 1 : dtrPage;
    if (value === "dtr") {
      setDtrPage(1);
    }
    if (
      value === "info" ||
      queryClient.getQueryData(
        userProfileKeys.tab(userId, searchedUserId, value, page),
      )
    ) {
      setActiveTab(value);
    }
  }

  function handleDtrLocationSaved(saved) {
    queryClient.setQueriesData(
      { queryKey: userProfileKeys.dtrPages(userId, searchedUserId) },
      (previous) => previous && ({
        ...previous,
        dtrLocation: {
          internship_id: saved.internship_id,
          is_custom_location: true,
          location: saved,
        },
      }),
    );
  }

  function refreshEvaluations() {
    void queryClient.invalidateQueries({
      queryKey: userProfileKeys.tab(userId, searchedUserId, "evaluations"),
    });
    void queryClient.invalidateQueries({
      queryKey: evaluationsKeys.all(userId),
    });
  }

  function refreshCertificates() {
    void queryClient.invalidateQueries({
      queryKey: userProfileKeys.tab(userId, searchedUserId, "certificates"),
    });
  }

  const isSwitching = selectedTab !== activeTab;
  const isPending = isSwitching || (activeTab !== "info" && tabQuery.isPending);
  const loadError = !isSwitching && tabQuery.isError
    ? tabQuery.error?.message || "Could not load this section."
    : "";
  const data = tabQuery.data;

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
        {loadError && !isPending ? (
          <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-6 text-sm">
            <p>{loadError}</p>
            <button type="button" className="mt-3 font-semibold text-primary-emphasis" onClick={() => void tabQuery.refetch()}>Try again</button>
          </div>
        ) : isPending ? (
          <TabContentSkeleton tab={selectedTab} userRole={userRole} />
        ) : (
          <>
            {activeTab === "dtr" && (
              <>
                <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                  <DtrTable
                    dtrs={data?.dtrData?.dtrs || []}
                  />
                  <DtrPagination
                    page={dtrPage}
                    totalPages={data?.dtrData?.totalPages}
                    onPageChange={setDtrPage}
                    disabled={tabQuery.isFetching}
                  />
                </div>

                {["employer", "admin"].includes(userRole) && data?.dtrLocation?.internship_id && (
                  <div className="mt-6">
                    <SetDtrLocation
                      studentId={searchedUserId}
                      dataLocation={normalizeDtrLocation(data?.dtrLocation)}
                      onSaved={handleDtrLocationSaved}
                    />
                  </div>
                )}
              </>
            )}

            {activeTab === "narratives" && (
              <StudentNarratives
                initialPage={data?.narrativeData}
                searchedUserId={searchedUserId}
                viewerId={userId}
              />
            )}

            {activeTab === "evaluations" && (
              <>
                {userRole === "employer" && (
                  <div className="bg-card rounded-xl border border-border shadow-sm p-4 sm:p-6 mb-6">
                    <StudentEvaluationCriteria
                      studentEvaluationCriterias={
                        data?.studentEvaluationCriterias
                      }
                      searchedUserId={searchedUserId}
                      userRole={userRole}
                      onSubmitted={refreshEvaluations}
                    />
                  </div>
                )}
                <StudentEvaluationList
                  studentId={searchedUserId}
                  pastEvaluations={data?.pastEvaluationsData?.data || []}
                  onChanged={refreshEvaluations}
                />
              </>
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
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default SearchedUserRecordsManager;
