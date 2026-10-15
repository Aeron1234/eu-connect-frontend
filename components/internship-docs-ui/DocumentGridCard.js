"use client";

import { format } from "date-fns";
import { Upload } from "lucide-react";
import StatusPill from "./DocumentStatusPill";
import DocumentActions from "./DocumentActions";

export default function DocumentGridCard({
  item,
  typeTone,
  getFileTypeLabel,
  canDelete,
  canApprove,
  handleDownload,
  handleApprove,
  isPending,
  userRole,
  currentUserId,
  onChanged,
}) {
  const typeLabel = getFileTypeLabel(item.file_type);
  

  return (
    <div
      key={item.id}
      className="group rounded-xl border border-border/60 bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold ${typeTone(typeLabel)}`}
        >
          {typeLabel}
        </div>
        <StatusPill status={item.verification_status} />
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
        <DocumentActions
          item={item}
          canDelete={canDelete}
          canApprove={canApprove}
          handleDownload={handleDownload}
          handleApprove={handleApprove}
          isPending={isPending}
          userRole={userRole}
          currentUserId={currentUserId}
          onChanged={onChanged}
        />
      </div>
    </div>
  );
}
