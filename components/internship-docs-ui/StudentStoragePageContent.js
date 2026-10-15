"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import PastInternshipDocuments from "./PastInternshipDocuments";
import CurrentInternshipDocs from "./CurrentInternshipDocuments";
import StudentStorageHeader from "./StudentStorageHeader";
import useStudentStorage from "./useStudentStorage";
import RecordsDocumentsSkeleton from "@/components/skeletons/RecordsDocumentsSkeleton";
import PastInternshipDocumentsSkeleton from "@/components/skeletons/PastInternshipDocumentsSkeleton";

function StoragePage() {
  const {
    currentUserId,
    activeQuery,
    typesQuery,
    pastQuery,
    ongoing,
    fileRequirementTypes,
    currentError,
    pastError,
    refreshError,
  } = useStudentStorage();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <StudentStorageHeader
        ongoing={ongoing}
        fileRequirementTypes={fileRequirementTypes}
        currentUserId={currentUserId}
        activeQuery={activeQuery}
        typesQuery={typesQuery}
      />

      {refreshError && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-4 text-sm">
          <p>{activeQuery.error?.message || typesQuery.error?.message || pastQuery.error?.message}</p>
          <button type="button" className="mt-2 font-semibold text-primary-emphasis" onClick={() => {
            if (activeQuery.isError) void activeQuery.refetch();
            if (typesQuery.isError) void typesQuery.refetch();
            if (pastQuery.isError) void pastQuery.refetch();
          }}>Try again</button>
        </div>
      )}

      {currentError ? (
        <ErrorUI error={activeQuery.error || typesQuery.error} reset={() => {
          if (activeQuery.isError) void activeQuery.refetch();
          if (typesQuery.isError) void typesQuery.refetch();
        }} logError={false} />
      ) : (activeQuery.isPending || typesQuery.isPending) && (
        <div role="status" aria-label="Loading current internship documents"><RecordsDocumentsSkeleton /></div>
      )}
      {pastError ? (
        <ErrorUI error={pastQuery.error} reset={() => void pastQuery.refetch()} logError={false} />
      ) : pastQuery.isPending && (
        <div role="status" aria-label="Loading past internship documents"><PastInternshipDocumentsSkeleton /></div>
      )}

      {!activeQuery.isPending && !typesQuery.isPending && !currentError && <CurrentInternshipDocs
        ongoing={ongoing}
        requirementTypes={fileRequirementTypes}
        currentUserId={currentUserId}
      />}
      {!pastQuery.isPending && !pastError && (
        <PastInternshipDocuments records={pastQuery.data || []} currentUserId={currentUserId} />
      )}
    </main>
  );
}

export default StoragePage;
