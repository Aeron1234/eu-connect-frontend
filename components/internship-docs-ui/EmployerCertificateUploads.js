"use client";

import { Building2 } from "lucide-react";
import EmployerCertificateUploadPanel from "./EmployerCertificateUploadPanel";
import EmployerCertificateFileList from "./EmployerCertificateFileList";
import useEmployerCertificateUploads from "./useEmployerCertificateUploads";

function EmployerCertificateUploads({
  searchedUserId,
  company,
  uploadedFiles,
  onChanged,
}) {
  const { files, isUploading, handleDownload, handleDelete, ...uploadProps } = useEmployerCertificateUploads({
    searchedUserId,
    company,
    uploadedFiles,
    onChanged,
  });
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg bg-primary-50 text-primary-emphasis flex items-center justify-center shrink-0"
        >
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Certificate of Completion
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload this student&apos;s Certificate of Completion on behalf of{" "}
            {company || "Company"}.
          </p>
        </div>
      </div>

      {/* Upload panel */}
      <EmployerCertificateUploadPanel {...uploadProps} isUploading={isUploading} />

      {/* Uploaded list */}
      <EmployerCertificateFileList
        files={files}
        isUploading={isUploading}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
      />
    </div>
  );
}
export default EmployerCertificateUploads;
