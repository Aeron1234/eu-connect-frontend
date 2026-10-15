"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { fileRequirementTypesOptions } from "@/lib/cache/reference-queries";
import { activeStorageRecordOptions, pastStorageRecordsOptions } from "@/lib/cache/student-storage-queries";
import Modal from "@/components/ui/Modal";
import ErrorUI from "@/components/ui/ErrorUI";
import ManualDialog from "@/components/ui/ManualDialog";
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
  const currentError = (activeQuery.isError && activeQuery.data === undefined) ||
    (typesQuery.isError && typesQuery.data === undefined);
  const pastError = pastQuery.isError && pastQuery.data === undefined;
  const refreshError = (activeQuery.isError && activeQuery.data !== undefined) ||
    (typesQuery.isError && typesQuery.data !== undefined) ||
    (pastQuery.isError && pastQuery.data !== undefined);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <PageTitle
            Icon={FolderOpen}
            title="Internship Documents Storage"
            description="Upload all of your internship-related files here."
            titleAction={ongoing && (
              <ManualDialog title="How to use internship storage">
                <div className="space-y-4 text-sm leading-relaxed text-foreground">
                  <p>Keep your internship requirements and other related files together here.</p>
                  <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
                    <li>Check the <strong>Before Deployment</strong> and <strong>After Deployment</strong> requirement lists to see which documents you still need to submit.</li>
                    <li>Select <strong>Upload File</strong>. Enter the company and file names, choose a PDF, text, Word, or Excel file, and select its requirement category. Select <strong>Save</strong> to upload it.</li>
                    <li>Use the category filters, search box, or grid/list buttons to find a document. Select the download icon to open or download it.</li>
                    <li>Use the trash icon to delete a document you uploaded, if deletion is available. If a supervisor-uploaded document is pending your review, use its check icon to approve it.</li>
                  </ol>
                  <p className="text-foreground-soft">Documents from earlier internships appear in the past-internship section below.</p>
                </div>
              </ManualDialog>
            )}
          />
        </div>

        {(activeQuery.isPending || typesQuery.isPending || activeQuery.isError || typesQuery.isError) ? (
          <div aria-disabled="true" className="w-full cursor-not-allowed opacity-50 md:ml-auto md:w-auto">
            <TitleButton><Upload className="w-4 h-4" /> Upload File</TitleButton>
          </div>
        ) : ongoing ? <div className="w-full md:ml-auto md:w-auto"><Modal
          trigger={
            <TitleButton>
              <Upload className="w-4 h-4" /> Upload File
            </TitleButton>
          }
          triggerStyles="w-full md:w-auto"
          title={"Upload file"}
        >
          <StorageUploadForm
            fileRequirementTypes={fileRequirementTypes}
            currentUserId={currentUserId}
            internshipId={ongoing?.id}
          />
        </Modal></div> : null}
      </div>

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
