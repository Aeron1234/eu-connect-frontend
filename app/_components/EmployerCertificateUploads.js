"use client";

import { useState, useCallback, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { format } from "date-fns";
import {
  Upload,
  FileText,
  Trash2,
  Download,
  Building2,
  X,
  Paperclip,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import {
  uploadCertificateOfCompletion,
  deleteEmployerCertificate,
} from "@/lib/server-actions/internship-docs-actions";
import { downloadSearchedStudentFiles } from "@/lib/server-actions/internship-docs-actions";
import { toastAndAction } from "../../lib/helpers";

function getFileTypeLabel(mimeType = "") {
  const m = mimeType.toLowerCase();
  if (m.includes("pdf")) return "PDF";
  if (m.includes("word") || m.includes("officedocument.wordprocessingml"))
    return "DOCX";
  if (m.includes("sheet") || m.includes("excel") || m.includes("csv"))
    return "XLSX";
  if (m.includes("image")) return "IMG";
  return "FILE";
}

function StatusBadge({ status }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock3 className="w-3 h-3" /> Awaiting confirmation
      </span>
    );
  }
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Confirmed
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
        Rejected
      </span>
    );
  }
  return null;
}

const EmployerCertificateUploads = ({
  searchedUserId,
  company,
  uploadedFiles,
}) => {
  const [files, setFiles] = useState(uploadedFiles || []);
  const [fileName, setFileName] = useState("");
  const [companyName, setCompanyName] = useState(company || "");
  const [pending, setPending] = useState(null);
  const [isUploading, startTransition] = useTransition();

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
      successLabel: "Certificate uploaded — awaiting student confirmation.",
      errorLabel: "Failed to upload certificate.",
      action: uploadCertificateOfCompletion,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (!result?.success) return;

      // 🌟 TODO: replace with a real refetch once revalidation is wired up —
      // this optimistically adds it, matching the real API's field shape
      setFiles([
        {
          id: result.id,
          file_name: fileName.trim() || pending.name,
          company_name: companyName.trim(),
          file_type: pending.type,
          created_at: new Date().toISOString(),
          verification_status: "pending",
        },
        ...files,
      ]);
      setPending(null);
      setFileName("");
    });
  }

  function handleDownload(fileId) {
    const formData = { searchedUserId, fileId };

    const handlers = {
      loadingLabel: "Opening certificate...",
      successLabel: "Certificate opened.",
      errorLabel: "Failed to open certificate.",
      action: downloadSearchedStudentFiles,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (!result?.success) return;

      window.open(result.url, "_blank", "noopener,noreferrer");
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
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (!result?.success) return;

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-emphasis flex items-center justify-center shrink-0">
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
      <div className="rounded-xl border border-dashed border-border bg-muted/50 p-4 sm:p-5 space-y-4">
        <div
          {...getRootProps()}
          className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-lg transition-colors cursor-pointer ${
            isDragActive ? "bg-primary-50" : "hover:bg-muted"
          }`}
        >
          <input {...getInputProps()} disabled={isUploading} />
          <Upload className="w-6 h-6 text-primary-emphasis" />
          <span className="text-sm font-medium text-foreground">
            {pending
              ? pending.name
              : isDragActive
                ? "Drop the file here"
                : "Click or drag a file to upload"}
          </span>
          <span className="text-xs text-muted-foreground">
            PDF, DOCX, XLSX or images
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              File Name
            </label>
            <input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. Certificate of Completion"
              disabled={isUploading}
              className="mt-1 w-full rounded-md border border-border bg-card text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Company Name
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Accenture"
              disabled={isUploading}
              className="mt-1 w-full rounded-md border border-border bg-card text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={!pending || isUploading}
            className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />{" "}
            {isUploading ? "Uploading..." : "Upload file"}
          </button>
          {pending && !isUploading && (
            <button
              onClick={() => {
                setPending(null);
                setFileName("");
              }}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Uploaded list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Uploaded files ({files.length})
        </p>
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
            <Paperclip className="w-8 h-8 text-foreground-faint" />
            <p className="text-sm text-muted-foreground">
              No certificate uploaded yet
            </p>
          </div>
        ) : (
          files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-emphasis flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-foreground truncate">
                    {f.file_name}
                  </p>
                  <StatusBadge status={f.verification_status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {f.company_name ? `${f.company_name} · ` : ""}
                  {getFileTypeLabel(f.file_type)} ·{" "}
                  {format(new Date(f.created_at), "MMM dd, yyyy")}
                </p>
              </div>
              <button
                onClick={() => handleDownload(f.id)}
                disabled={isUploading}
                className="p-1.5 rounded-md text-foreground-subtle hover:bg-muted hover:text-foreground transition-colors disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
              </button>
              {f.verification_status === "pending" && (
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={isUploading}
                  className="p-1.5 rounded-md text-foreground-subtle hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployerCertificateUploads;
