import { notFound } from "next/navigation";
import {
  getSearchedStudentDtrLocation,
  getSearchedStudentDTRs,
  getSearchedStudentNarratives,
  getStudentEvaluationCriterias,
  getStudentPastEvaluations,
  getEmployerUploadedFiles,
} from "../app/_services/services";

import DtrTable from "../app/_components/DtrTable";
import StudentNarratives from "../app/_components/StudentNarratives";
import StudentEvaluationCriteria from "../app/_components/StudentEvaluationCriteria";
import SetDtrLocation from "../app/_components/SetDtrLocation";
import EmployerCertificateUploads from "../app/_components/EmployerCertificateUploads";
import ProfileInfoGrid from "../app/_components/ProfileInfoGrid";
import EvaluationCard from "../app/_components/EvaluationCard";

export default async function SearchedUserRecords({
  filter,
  searchedUserId,
  userId = "",
  userRole = "",
  searchedUserRole = "",
  currentDtrPage = 1,
  searchedUserInfo = null,
}) {
  if (searchedUserRole !== "student") {
    if (filter !== "info") return notFound();
    return (
      <EmployerInfoTab
        searchedUserId={searchedUserId}
        info={searchedUserInfo}
        role={searchedUserRole}
      />
    );
  }

  if (userRole === "student" && filter !== "info") {
    return null;
  }

  const isAuthorizedStaff = ["department_head", "employer", "admin"].includes(
    userRole,
  );

  switch (filter) {
    case "dtr":
      if (!isAuthorizedStaff) return null;
      return (
        <>
          <DtrTab
            searchedUserId={searchedUserId}
            currentDtrPage={currentDtrPage}
          />

          <SetLocationForm
            searchedUserId={searchedUserId}
            userRole={userRole}
          />
        </>
      );

    case "narratives":
      if (!isAuthorizedStaff) return null;
      return <NarrativesTab searchedUserId={searchedUserId} />;

    case "evaluations":
      if (!isAuthorizedStaff) return null;
      return (
        <EvaluationsTab
          searchedUserId={searchedUserId}
          userRole={userRole}
          userId={userId}
        />
      );

    case "certificates":
      if (!["employer", "admin"].includes(userRole)) return notFound();
      return (
        <EmployerCertificateTab
          searchedUserId={searchedUserId}
          userRole={userRole}
          userId={userId}
        />
      );
    case "info":
      return (
        <InfoTab searchedUserId={searchedUserId} info={searchedUserInfo} />
      );

    default:
      return notFound();
  }
}

async function DtrTab({ searchedUserId, currentDtrPage }) {
  const dtrData = await getSearchedStudentDTRs(searchedUserId, currentDtrPage);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      <DtrTable
        searchedUserId={searchedUserId}
        dtrs={dtrData?.dtrs}
        currentDtrPage={currentDtrPage}
        totalPages={dtrData?.totalPages}
        isStudentDashboard={false}
      />
    </div>
  );
}

async function SetLocationForm({ searchedUserId, userRole }) {
  if (!["employer", "admin"].includes(userRole)) return null;

  const searchedStudentDtrLocation =
    (await getSearchedStudentDtrLocation(searchedUserId)) || {};

  const dataLocation = {
    internship_id: searchedStudentDtrLocation?.internship_id,
    is_custom_location: searchedStudentDtrLocation?.is_custom_location || false,
    location: {
      lat: searchedStudentDtrLocation?.location?.lat,
      lon: searchedStudentDtrLocation?.location?.lon,
      radius_meters: searchedStudentDtrLocation?.location?.radius_meters,
      label: searchedStudentDtrLocation?.location?.label,
      address: searchedStudentDtrLocation?.location?.address || null,
      set_by: searchedStudentDtrLocation?.location?.set_by || null,
      created_at: searchedStudentDtrLocation?.location?.created_at || null,
      updated_at: searchedStudentDtrLocation?.location?.updated_at || null,
    },
  };

  return (
    <SetDtrLocation studentId={searchedUserId} dataLocation={dataLocation} />
  );
}

async function NarrativesTab({ searchedUserId }) {
  const narrativeData = await getSearchedStudentNarratives(searchedUserId);

  return (
    <StudentNarratives
      narratives={narrativeData?.narratives || []}
      totalPages={narrativeData?.totalPages || 1}
      searchedUserId={searchedUserId}
    />
  );
}

async function EvaluationsTab({ searchedUserId, userRole, userId }) {
  const [pastEvaluationsData, studentEvaluationCriterias] = await Promise.all([
    getStudentPastEvaluations(searchedUserId),
    userRole === "employer" ? getStudentEvaluationCriterias() : null,
  ]);

  const pastEvaluations = pastEvaluationsData || [];

  return (
    <>
      {userRole === "employer" && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6 mb-8">
          <StudentEvaluationCriteria
            studentEvaluationCriterias={studentEvaluationCriterias}
            searchedUserId={searchedUserId}
            userRole={userRole}
          />
        </div>
      )}

      <div className="">
        <EvaluationCard evaluations={pastEvaluations ?? []} />
      </div>
    </>
  );
}

async function EmployerCertificateTab({ searchedUserId, userRole, userId }) {
  const uploadedFiles = await getEmployerUploadedFiles(searchedUserId);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      <EmployerCertificateUploads
        searchedUserId={searchedUserId}
        uploadedFiles={uploadedFiles}
      />
    </div>
  );
}

async function InfoTab({ searchedUserId, info }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      <ProfileInfoGrid info={info} />
    </div>
  );
}

async function EmployerInfoTab({ searchedUserId, info, role }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      <ProfileInfoGrid info={info} />
    </div>
  );
}
