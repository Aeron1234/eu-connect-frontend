"use client";

import { format } from "date-fns";
import { FileText, Trash2, Download, Paperclip } from "lucide-react";
import StatusBadge from "./EmployerCertificateStatusBadge";

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
export default function EmployerCertificateFileList({ files, isUploading, handleDownload, handleDelete }) { return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Uploaded files ({files.length})
      </p>
      {files.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center"
        >
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
            <div
              className="w-9 h-9 rounded-lg bg-primary-50 text-primary-emphasis flex items-center justify-center shrink-0"
            >
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
              type="button"
              aria-label="Download"
              onClick={() => handleDownload(f.id, f)}
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
  ); }
