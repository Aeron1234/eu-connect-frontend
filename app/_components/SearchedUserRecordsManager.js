"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import SearchedUserFilter from "./SearchedUserFilter";
import DtrTable from "./DtrTable";
import SetDtrLocation from "./SetDtrLocation";
import StudentNarratives from "./StudentNarratives";
import StudentEvaluationList from "./StudentEvaluationList";
import StudentEvaluationCriteria from "./StudentEvaluationCriteria";
import EmployerCertificateUploads from "./EmployerCertificateUploads";
import ProfileInfoGrid from "./ProfileInfoGrid";
import {
  getSearchedStudentDTRs,
  getSearchedStudentDtrLocation,
  getSearchedStudentNarratives,
  getStudentPastEvaluations,
  getStudentEvaluationCriterias,
  getEmployerUploadedFiles,
} from "../_services/services";

function buildTabs({ userRole, searchedUserRole }) {
  if (searchedUserRole !== "student") {
    return [{ value: "info", text: "Info" }];
  }
  if (userRole === "student") {
    return [{ value: "info", text: "Info" }];
  }
  if (userRole === "employer") {
    return [
      { value: "dtr", text: "DTR" },
      { value: "narratives", text: "Narratives" },
      { value: "evaluations", text: "Evaluations" },
      { value: "certificates", text: "Certificates" },
      { value: "info", text: "Info" },
    ];
  }
  // admin / department_head
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
}) {
  const tabs = buildTabs({ userRole, searchedUserRole });

  const [selectedTab, setSelectedTab] = useState(defaultFilter);
  const [filter, setFilter] = useState(defaultFilter);
  const [dtrPage, setDtrPage] = useState(currentDtrPage || 1);
  const [data, setData] = useState(
    defaultFilter === "dtr"
      ? { dtrData: initialDtrData, dtrLocation: initialDtrLocation }
      : {},
  );
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  // Info's data (`info`) is already resolved server-side and handed down
  // regardless of the active tab — switching to it never needs a fetch.
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
      const narrativeData = await getSearchedStudentNarratives(searchedUserId);
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

    // No fetch needed — info is always already on hand.
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

  return (
    <>
      <SearchedUserFilter
        tabs={tabs}
        selectedTab={selectedTab}
        onSelect={handleTabClick}
      />

      <div className="mt-6">
        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            {filter === "dtr" && (
              <>
                <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6">
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
