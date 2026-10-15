"use client";

import { Upload, X } from "lucide-react";

export default function EmployerCertificateUploadPanel({
  getRootProps,
  getInputProps,
  isDragActive,
  pending,
  setPending,
  fileName,
  setFileName,
  companyName,
  setCompanyName,
  isUploading,
  handleUpload,
}) { return (
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
  ); }
