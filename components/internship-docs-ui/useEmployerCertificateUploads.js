"use client";

import { useState, useCallback, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import {
  uploadCertificateOfCompletion,
  deleteEmployerCertificate,
  downloadSearchedStudentFiles,
} from "@/lib/server-actions/internship-docs-actions";
import { toastAndAction } from "@/lib/helpers";
import useDocumentActions from "./useDocumentActions";

export default function useEmployerCertificateUploads({ searchedUserId, company, uploadedFiles, onChanged }) {
  const [filesOverride, setFilesOverride] = useState(null);
  // Keep a confirmed local change only while the parent still supplies the same list.
  // A new server list replaces the override instead of being merged with stale rows.
  const files = filesOverride?.source === uploadedFiles
    ? filesOverride.files
    : uploadedFiles || [];
  const [fileName, setFileName] = useState("");
  const [companyName, setCompanyName] = useState(company || "");
  const [pending, setPending] = useState(null);
  const [isUploading, startTransition] = useTransition();
  const { isPending: isDownloading, handleDownload } = useDocumentActions({
    downloadAction: ({ fileId }) => downloadSearchedStudentFiles({ searchedUserId, fileId }),
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPending(file);
      setFileName((prev) => prev || file.name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
  });

  function handleUpload() {
    if (!pending) return;

    const formData = new FormData();
    formData.append("file", pending);
    formData.append("file_name", fileName.trim() || pending.name);
    formData.append("company_name", companyName.trim());
    formData.append("searchedUserId", searchedUserId);

    const handlers = {
      loadingLabel: "Uploading certificate...",
      timeoutMs: 120000,
        timeoutLabel: "Upload confirmation timed out. Refresh this page before trying again.",
      successLabel: "Certificate uploaded — awaiting student confirmation.",
      errorLabel: "Failed to upload certificate.",
      action: uploadCertificateOfCompletion,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers).catch(() => null);
      // A timeout may still have committed. Refresh without adding a guessed certificate row.
      if (result?.timedOut) onChanged?.();
      if (!result?.success) return;

      // Show the confirmed upload immediately using the API row shape, then request
      // the profile's certificate refresh through onChanged. Fresh props replace this override.
      setFilesOverride({ source: uploadedFiles, files: [
        {
          id: result.id,
          file_name: fileName.trim() || pending.name,
          company_name: companyName.trim(),
          file_type: pending.type,
          created_at: new Date().toISOString(),
          verification_status: "pending",
        },
        ...files,
      ] });
      setPending(null);
      setFileName("");
      onChanged?.();
    });
  }

  function handleDelete(fileId) {
    const formData = new FormData();
    formData.append("searchedUserId", searchedUserId);
    formData.append("fileId", fileId);

    const handlers = {
      loadingLabel: "Deleting certificate...",
      successLabel: "Certificate deleted.",
      errorLabel: "Failed to delete certificate.",
      action: deleteEmployerCertificate,
      args: [formData],
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (!result?.success) return;

      // Remove the local certificate row only after the delete succeeds, then refresh.
      setFilesOverride({
        source: uploadedFiles,
        files: files.filter((f) => f.id !== fileId),
      });
      onChanged?.();
    });
  }
  return {
    files,
    fileName,
    setFileName,
    companyName,
    setCompanyName,
    pending,
    setPending,
    isUploading: isUploading || isDownloading,
    getRootProps,
    getInputProps,
    isDragActive,
    handleUpload,
    handleDownload,
    handleDelete,
  };
}
