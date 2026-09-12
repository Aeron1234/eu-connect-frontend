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
} from "../_services/employer-actions";
import { downloadSearchedStudentFiles } from "../_services/services";
import { toastAndAction } from "../_services/helpers";

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
      // default the file name field to the actual file's name — still editable
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
      if (!result?.success) return; // toastAndAction already showed the error toast

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
      if (!result?.success) return; // toastAndAction already showed the error toast

      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  function handleDelete(fileId) {
    const formData = new FormData();
    formData.append("searchedUserId", searchedUserId);
    formData.append("fileId", fileId);

    console.log(
      "Deleting file with ID:",
      fileId,
      "for searchedUserId:",
      searchedUserId,
    );

    const handlers = {
      loadingLabel: "Deleting certificate...",
      successLabel: "Certificate deleted.",
      errorLabel: "Failed to delete certificate.",
      action: deleteEmployerCertificate,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);
      if (!result?.success) return; // toastAndAction already showed the error toast

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
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
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 space-y-4">
        <div
          {...getRootProps()}
          className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-lg transition-colors cursor-pointer ${
            isDragActive
              ? "bg-primary-500/5 border-primary"
              : "hover:bg-muted/60"
          }`}
        >
          <input {...getInputProps()} disabled={isUploading} />
          <Upload className="w-6 h-6 text-primary-500" />
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
              className="mt-1 w-full rounded-md border bg-card text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
              className="mt-1 w-full rounded-md border bg-card text-foreground text-sm px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUpload}
            disabled={!pending || isUploading}
            className="inline-flex items-center gap-1.5 bg-primary-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
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
          <div className="py-10 text-center text-muted-foreground">
            <Paperclip className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No certificate uploaded yet</p>
          </div>
        ) : (
          files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
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
                className="p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
              </button>
              {f.verification_status === "pending" && (
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={isUploading}
                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
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
