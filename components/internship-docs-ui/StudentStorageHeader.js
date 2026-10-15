"use client";

import Modal from "@/components/ui/Modal";
import ManualDialog from "@/components/ui/ManualDialog";
import StorageUploadForm from "./StorageUploadForm";
import { FolderOpen, Upload } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import TitleButton from "@/components/ui/TitleButton";

export default function StudentStorageHeader({ ongoing, fileRequirementTypes, currentUserId, activeQuery, typesQuery }) {
  return (
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
      ) : ongoing ? <div className="w-full md:ml-auto md:w-auto"><Modal variant="form"
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
  );
}
