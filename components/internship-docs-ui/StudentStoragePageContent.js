"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { fileRequirementTypesOptions } from "@/lib/cache/reference-queries";
import { activeStorageRecordOptions, pastStorageRecordsOptions } from "@/lib/cache/student-storage-queries";
import Modal from "@/components/ui/Modal";
import StorageUploadForm from "@/components/internship-docs-ui/StorageUploadForm";
import RecordsDocuments from "@/components/internship-docs-ui/RecordsDocuments";
import PastInternshipDocuments from "@/components/internship-docs-ui/PastInternshipDocuments";
import {
  downloadInternshipFile,
} from "@/lib/server-actions/internship-docs-actions";
import { FolderOpen, Upload } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import TitleButton from "@/components/ui/TitleButton";
import RecordsDocumentsSkeleton from "@/components/skeletons/RecordsDocumentsSkeleton";
import PastInternshipDocumentsSkeleton from "@/components/skeletons/PastInternshipDocumentsSkeleton";

function StoragePage() {
  const { user } = useUser();
  const currentUserId = user?.id || "";
  const activeQuery = useQuery({ ...activeStorageRecordOptions(currentUserId), enabled: Boolean(currentUserId) });
  const typesQuery = useQuery({ ...fileRequirementTypesOptions(currentUserId), enabled: Boolean(currentUserId) });
  const pastQuery = useQuery({ ...pastStorageRecordsOptions(currentUserId), enabled: Boolean(currentUserId) });
  const ongoing = activeQuery.data;
  const fileRequirementTypes = typesQuery.data || [];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <PageTitle
          Icon={FolderOpen}
          title={"Internship Documents Storage"}
          description={"Upload all of your internship-related files here."}
        />

        {(activeQuery.isPending || typesQuery.isPending || activeQuery.isError || typesQuery.isError) ? (
          <div aria-disabled="true" className="cursor-not-allowed opacity-50">
            <TitleButton><Upload className="w-4 h-4" /> Upload File</TitleButton>
          </div>
        ) : <Modal
          trigger={
            <TitleButton>
              <Upload className="w-4 h-4" /> Upload File
            </TitleButton>
          }
          triggerStyles="max-xs:w-full"
          title={"Upload file"}
        >
          <StorageUploadForm
            fileRequirementTypes={fileRequirementTypes}
            currentUserId={currentUserId}
            internshipId={ongoing?.id}
          />
        </Modal>}
      </div>

      {(activeQuery.isError || typesQuery.isError || pastQuery.isError) && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-4 text-sm">
          <p>{activeQuery.error?.message || typesQuery.error?.message || pastQuery.error?.message}</p>
          <button type="button" className="mt-2 font-semibold text-primary-emphasis" onClick={() => {
            if (activeQuery.isError) void activeQuery.refetch();
            if (typesQuery.isError) void typesQuery.refetch();
            if (pastQuery.isError) void pastQuery.refetch();
          }}>Try again</button>
        </div>
      )}

      {(activeQuery.isPending || typesQuery.isPending) && (
        <div role="status" aria-label="Loading current internship documents"><RecordsDocumentsSkeleton /></div>
      )}
      {pastQuery.isPending && (
        <div role="status" aria-label="Loading past internship documents"><PastInternshipDocumentsSkeleton /></div>
      )}

      {!activeQuery.isPending && !activeQuery.isError && !typesQuery.isPending && !typesQuery.isError && <CurrentInternshipDocs
        ongoing={ongoing}
        requirementTypes={fileRequirementTypes}
        currentUserId={currentUserId}
      />}
      {!pastQuery.isPending && !pastQuery.isError && (
        <PastInternshipDocuments records={pastQuery.data || []} currentUserId={currentUserId} />
      )}
    </main>
  );
}

function CurrentInternshipDocs({
  ongoing,
  requirementTypes,
  currentUserId,
}) {
  if (!ongoing) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        You don&apos;t currently have an ongoing internship.
      </div>
    );
  }

  return (
    <RecordsDocuments
      requirementTypes={requirementTypes || []}
      internshipId={ongoing.id}
      userRole="student"
      currentUserId={currentUserId}
      downloadAction={downloadInternshipFile}
    />
  );
}

export default StoragePage;
