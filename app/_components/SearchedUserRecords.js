import { notFound } from "next/navigation";
import {
  getSearchedStudentDtrLocation,
  getSearchedStudentDTRs,
  getSearchedStudentFiles,
  getSearchedStudentNarratives,
  getStudentEvaluationCriterias,
  getStudentPastEvaluations,
  getFileRequirementTypes,
  getEmployerUploadedFiles,
} from "../_services/services";

import DtrTable from "./DtrTable";
import StudentDocuments from "./StudentDocuments";
import StudentNarratives from "./StudentNarratives";
// import EmployerProfileInfo from "./EmployerProfileInfo"; // Uncomment when ready
import StudentEvaluationList from "./StudentEvaluationList";
import StudentEvaluationCriteria from "./StudentEvaluationCriteria";
import SetDtrLocation from "./SetDtrLocation";
import { FolderOpen } from "lucide-react";
import EmployerCertificateUploads from "./EmployerCertificateUploads";

export default async function SearchedUserRecords({
  filter,
  searchedUserId,
  userId = "",
  userRole = "",
  searchedUserRole = "",
  currentDtrPage = 1,
}) {
  if (searchedUserRole !== "student") {
    if (filter !== "info") return notFound();
    return <EmployerInfoTab searchedUserId={searchedUserId} />;
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

    case "documents":
      // Only internal academic administrators manage legal/compliance folders
      if (!["department_head", "admin"].includes(userRole)) return notFound();
      return (
        <DocumentsTab searchedUserId={searchedUserId} userRole={userRole} />
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
      return <InfoTab searchedUserId={searchedUserId} />;

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
      set_by: searchedStudentDtrLocation?.location?.set_by || null,
      created_at: searchedStudentDtrLocation?.location?.created_at || null,
      updated_at: searchedStudentDtrLocation?.location?.updated_at || null,
    },
  };

  console.log(dataLocation);

  return (
    <SetDtrLocation
      searchedUserId={searchedUserId}
      dataLocation={dataLocation}
    />
  );
}

async function NarrativesTab({ searchedUserId }) {
  const narrativeData = await getSearchedStudentNarratives(searchedUserId);
  console.log(narrativeData);
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

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
        <StudentEvaluationList
          studentId={searchedUserId}
          pastEvaluations={pastEvaluations?.data || []}
          userId={userId}
        />
      </div>
    </>
  );
}

async function DocumentsTab({ searchedUserId, userRole }) {
  const [fileData, requirementTypes] = await Promise.all([
    getSearchedStudentFiles(searchedUserId),
    getFileRequirementTypes(),
  ]);
  console.log("DocumentsTab file data:", fileData);
  console.log("DocumentsTab requirement types:", requirementTypes);
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      {fileData.length > 0 ? (
        fileData.map((data) => (
          <StudentDocuments
            searchedUserId={searchedUserId}
            fileData={data}
            requirementTypes={requirementTypes}
            key={data.id}
          />
        ))
      ) : (
        <div className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No documents yet
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Internship documents will appear here once uploaded.
          </p>
        </div>
      )}
    </div>
  );
}

async function EmployerCertificateTab({ searchedUserId, userRole, userId }) {
  const uploadedFiles = await getEmployerUploadedFiles(searchedUserId);

  console.log("EmployerCertificateTab uploaded files:", uploadedFiles);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      <EmployerCertificateUploads
        searchedUserId={searchedUserId}
        uploadedFiles={uploadedFiles}
      />
    </div>
  );
}

async function InfoTab({ searchedUserId }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      Student info place holder
    </div>
  );
}

async function EmployerInfoTab({ searchedUserId }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-4 sm:p-6">
      {/* <EmployerProfileInfo searchedUserId={searchedUserId} /> */}
      <p className="text-sm text-stone-500">
        Employer profile details layout placeholder.
      </p>
    </div>
  );
}
