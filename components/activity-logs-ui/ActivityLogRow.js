import { Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import DeleteForm from "../ui/DeleteForm";
import {
  ROLE_LABELS,
  toSentenceCase,
  toTitleCase,
  formatTimestamp,
  parseMetadata,
  postingDetails,
} from "./activityLogFormatting";

export default function ActivityLogRow({ log, handleDelete, isDeleting }) {
  const metadata = parseMetadata(log.metadata);
  const ip = metadata?.ip_address || metadata?.ip;
  const createdPosting = log.action === "internship_posting_created" && metadata?.position;
  const details = createdPosting ? postingDetails(metadata) : [];
  return (
    <tr
      key={log.id}
      className="border-b border-border last:border-0"
    >
      <td className="px-4 sm:px-5 py-3 max-w-[180px]">
        <p className="font-medium text-foreground truncate">
          {log.actor_name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {ROLE_LABELS[log.actor_role] ||
            toTitleCase(log.actor_role)}
          {ip ? ` · ${ip}` : ""}
        </p>
      </td>
      <td className="px-4 sm:px-5 py-3 max-w-[280px]">
        <p className="font-medium text-foreground">
          {createdPosting ? `Created internship post: ${metadata.position}` : toSentenceCase(log.action)}
        </p>
        {log.description && !createdPosting && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {log.description}
          </p>
        )}
        {createdPosting && (
          <>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {[metadata.company_name, metadata.location].filter(Boolean).join(" · ") || log.description}
            </p>
            {details.length > 0 && (
              <details className="mt-1.5 text-xs">
                <summary className="w-fit cursor-pointer font-semibold text-primary-emphasis">View submitted details</summary>
                <dl className="mt-2 space-y-1.5 rounded-lg border border-border bg-muted/40 p-2.5">
                  {details.map(([label, value]) => (
                    <div key={label} className="break-words">
                      <dt className="font-semibold text-foreground-soft">{label}</dt>
                      <dd className="whitespace-pre-wrap text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
          </>
        )}
      </td>
      <td className="px-4 sm:px-5 py-3 text-muted-foreground whitespace-nowrap">
        {toTitleCase(log.target_type)}
      </td>
      <td className="px-4 sm:px-5 py-3 text-muted-foreground whitespace-nowrap">
        {formatTimestamp(log.created_at)}
      </td>
      <td className="px-4 sm:px-5 py-3 text-right">
        <Modal variant="confirmation"
          trigger={
            <div
              title="Delete log entry"
              className="rounded-md p-2 text-foreground-subtle hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <Trash2 className="size-4" />
            </div>
          }
          title={
            <span className={`text-primary-emphasis`}>
              Delete Activity Log
            </span>
          }
        >
          <DeleteForm
            handleAction={handleDelete}
            id={log.id}
            isPending={isDeleting}
            name={"logId"}
          />
        </Modal>
      </td>
    </tr>
  );
}
