"use client";

import { format } from "date-fns";
import StatusPill from "./DocumentStatusPill";
import DocumentActions from "./DocumentActions";

export default function DocumentListRow({
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
    <div className="flex items-center gap-3 p-3 bg-card hover:bg-muted/50 transition-colors">
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
      <StatusPill status={item.verification_status} />
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
        className="flex items-center gap-1 shrink-0"
      />
    </div>
  );
}
