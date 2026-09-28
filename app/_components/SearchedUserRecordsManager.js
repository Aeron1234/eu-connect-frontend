"use client";

import { useEffect, useRef, useState } from "react";
import SearchedUserFilter from "./SearchedUserFilter";
import DtrTable from "./DtrTable";
import SetDtrLocation from "./SetDtrLocation";
import StudentNarratives from "./StudentNarratives";
import StudentEvaluationList from "./StudentEvaluationList";
import StudentEvaluationCriteria from "./StudentEvaluationCriteria";
import EmployerCertificateUploads from "./EmployerCertificateUploads";
import ProfileInfoGrid from "./ProfileInfoGrid";
import TabContentSkeleton from "./TabContentSkeleton";
import { getEmployerUploadedFiles } from "@/lib/server-actions/internship-docs-actions";
import { getSearchedStudentWeeklyNarratives } from "@/lib/server-actions/weekly-narratives-actions";
import {
  getStudentPastEvaluations,
  getStudentEvaluationCriterias,
} from "@/lib/server-actions/evaluations-actions";
import {
  getSearchedStudentDtrLocation,
  getSearchedStudentDTRs,
} from "@/lib/server-actions/dtr-actions";

function buildTabs({ userRole, searchedUserRole, supervision }) {
  if (searchedUserRole !== "student") {
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
  info,
  defaultFilter,
  initialDtrData,
  initialDtrLocation,
  currentDtrPage,
  supervision,
}) {
  const tabs = buildTabs({ userRole, searchedUserRole, supervision });

  const safeDefaultFilter = tabs.some((tab) => tab.value === defaultFilter)
    ? defaultFilter
    : "info";

  const [selectedTab, setSelectedTab] = useState(safeDefaultFilter);
  const [filter, setFilter] = useState(safeDefaultFilter);
  const [dtrPage, setDtrPage] = useState(currentDtrPage || 1);
  const [data, setData] = useState(
    safeDefaultFilter === "dtr"
      ? { dtrData: initialDtrData, dtrLocation: initialDtrLocation }
      : {},
  );
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  const fetchers = {
    dtr: async () => {
      const [dtrData, dtrLocation] = await Promise.all([
        getSearchedStudentDTRs(searchedUserId, 1),
        ["employer", "admin"].includes(userRole)
          ? getSearchedStudentDtrLocation(searchedUserId)
          : null,
      ]);
      return { dtrData, dtrLocation };
    },
    narratives: async () => {
      const narrativeData =
        await getSearchedStudentWeeklyNarratives(searchedUserId);
      return { narrativeData };
    },
    evaluations: async () => {
      const [pastEvaluationsData, studentEvaluationCriterias] =
        await Promise.all([
          getStudentPastEvaluations(searchedUserId),
          userRole === "employer" ? getStudentEvaluationCriterias() : null,
        ]);
      return { pastEvaluationsData, studentEvaluationCriterias };
    },
    certificates: async () => {
      const uploadedFiles = await getEmployerUploadedFiles(searchedUserId);
      return { uploadedFiles };
    },
  };

  function handleTabClick(value) {
    setSelectedTab(value);
  }

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (selectedTab === filter) return;

    if (selectedTab === "info") {
      setFilter("info");
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
        if (selectedTab === "dtr") setDtrPage(1);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading profile tab:", error);
          setFilter(selectedTab);
          setData({});
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [selectedTab, filter]);

  // NEW — mirrors the server's DTR props into local state whenever they
  // change. This is what makes pagination actually work: clicking the
  // Pagination Link navigates to ?filter=dtr&d_page=N, the server page
  // re-runs and passes fresh initialDtrData/currentDtrPage, and this
  // effect just reflects that into what the table renders. No client
  // fetch, no request-id bookkeeping — same "let the server handle it"
  // approach as the student dashboard.
  useEffect(() => {
    setDtrPage(currentDtrPage || 1);
    setData((prev) => ({
      ...prev,
      dtrData: initialDtrData,
      dtrLocation: initialDtrLocation ?? prev.dtrLocation,
    }));
  }, [initialDtrData, currentDtrPage, initialDtrLocation]);

  return (
    <>
      <SearchedUserFilter
        tabs={tabs}
        selectedTab={selectedTab}
        onSelect={handleTabClick}
      />

      <div className="mt-6">
        {isPending ? (
          <TabContentSkeleton tab={selectedTab} userRole={userRole} />
        ) : (
          <>
            {filter === "dtr" && (
              <>
                <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6 overflow-x-scroll">
                  <DtrTable
                    searchedUserId={searchedUserId}
                    dtrs={data?.dtrData?.dtrs}
                    currentDtrPage={dtrPage}
                    totalPages={data?.dtrData?.totalPages}
                    isStudentDashboard={false}
                  />
                </div>

                {["employer", "admin"].includes(userRole) && (
                  <div className="mt-6">
                    <SetDtrLocation
                      studentId={searchedUserId}
                      dataLocation={normalizeDtrLocation(data?.dtrLocation)}
                    />
                  </div>
                )}
              </>
            )}

            {filter === "narratives" && (
              <StudentNarratives
                narratives={data?.narrativeData?.narratives || []}
                totalPages={data?.narrativeData?.totalPages || 1}
                searchedUserId={searchedUserId}
              />
            )}

            {filter === "evaluations" && (
              <>
                {userRole === "employer" && (
                  <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6 mb-6">
                    <StudentEvaluationCriteria
                      studentEvaluationCriterias={
                        data?.studentEvaluationCriterias
                      }
                      searchedUserId={searchedUserId}
                      userRole={userRole}
                    />
                  </div>
                )}
                <StudentEvaluationList
                  studentId={searchedUserId}
                  pastEvaluations={data?.pastEvaluationsData?.data || []}
                />
              </>
            )}

            {filter === "certificates" && (
              <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6">
                <EmployerCertificateUploads
                  searchedUserId={searchedUserId}
                  uploadedFiles={data?.uploadedFiles}
                />
              </div>
            )}

            {filter === "info" && (
              <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6">
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
