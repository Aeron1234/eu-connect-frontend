"use client";

import { format } from "date-fns";
import { Download, Trash2, Upload } from "lucide-react";
import { useTransition } from "react";
import { toastAndAction } from "../_services/helpers";
import { downloadInternshipRecordDocuments } from "../_services/dept-head-actions";

function SearchedStudentFiles({
  filtered,
  view,
  typeTone,
  getFileTypeLabel,
  userRole = "",
  internshipId = "",
}) {
  const [isPending, startTransition] = useTransition();

  function handleDownload(id) {
    const formData = { fileId: id, internshipId };

    const handlers = {
      loadingLabel: "Opening / downloading file...",
      successLabel: "File was opened / downloaded.",
      errorLabel: "Failed to open / download file.",
      action: downloadInternshipRecordDocuments,
      formData,
    };

    startTransition(async () => {
      const result = await toastAndAction(handlers);

      if (!result?.success) return; // toastAndAction already showed the error toast

      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  if (filtered.length === 0)
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No documents match your search.
      </div>
    );

  if (view === "grid")
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
        {filtered.map((item) => (
          <GridView
            key={item.id}
            item={item}
            typeTone={typeTone}
            getFileTypeLabel={getFileTypeLabel}
            userRole={userRole}
            handleDownload={handleDownload}
            isPending={isPending}
          />
        ))}
      </div>
    );

  return (
    <div className="rounded-xl border border-border/60 divide-y divide-border/60 overflow-hidden">
      {filtered.map((item) => (
        <ListView
          key={item.id}
          item={item}
          typeTone={typeTone}
          getFileTypeLabel={getFileTypeLabel}
          userRole={userRole}
          handleDownload={handleDownload}
          isPending={isPending}
        />
      ))}
    </div>
  );
}

function GridView({
  item,
  typeTone,
  getFileTypeLabel,
  userRole = "",
  handleDownload,
  isPending,
}) {
  const typeLabel = getFileTypeLabel(item.file_type);

  return (
    <div
      key={item.id}
      className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary-500/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold ${typeTone(typeLabel)}`}
        >
          {typeLabel}
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-foreground line-clamp-2 leading-snug">
        {item.file_name}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">{item.category}</p>
      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Upload className="w-3 h-3" />{" "}
          {format(new Date(item.created_at), "MMM dd, yyyy")}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary-500/10 transition-colors"
            aria-label="Download"
            onClick={() => handleDownload(item.id)}
            disabled={isPending}
          >
            <Download className="w-4 h-4" />
          </button>
          {userRole === "admin" && (
            <button
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary-500/10 transition-colors"
              aria-label="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ListView({
  item,
  typeTone,
  getFileTypeLabel,
  userRole = "",
  handleDownload,
  isPending,
}) {
  const typeLabel = getFileTypeLabel(item.file_type);

  return (
    <div className="flex items-center gap-3 p-3 bg-white hover:bg-stone-50 transition-colors">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${typeTone(typeLabel)}`}
      >
        {typeLabel}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">
          {item.file_name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">
          {item.category} · {format(new Date(item.created_at), "MMM dd, yyyy")}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary-500/10 transition-colors"
          aria-label="Download"
          onClick={() => handleDownload(item.id)}
          disabled={isPending}
        >
          <Download className="w-4 h-4" />
        </button>
        {userRole === "admin" && (
          <button
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary-500/10 transition-colors"
            aria-label="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchedStudentFiles;
