import { Trash2 } from "lucide-react";
import Modal from "../ui/Modal";
import DeleteForm from "../ui/DeleteForm";
import {
  ROLE_LABELS,
  toTitleCase,
  activityActionLabel,
  activityModuleLabel,
  activityDescription,
  activityUpdateFields,
  formatTimestamp,
  parseMetadata,
  postingDetails,
} from "./activityLogFormatting";

export default function ActivityLogRow({ log, handleDelete, isDeleting }) {
  const metadata = parseMetadata(log.metadata);
  const ip = metadata?.ip_address || metadata?.ip;
  const createdPosting = log.action === "internship_posting_created" && metadata?.position;
  const details = createdPosting ? postingDetails(metadata) : [];
  const description = activityDescription(log);
  const updatedFields = activityUpdateFields(log);
  return (
    <tr
      key={log.id}
      className="border-b border-border last:border-0"
    >
      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
        <p className="font-medium text-foreground whitespace-nowrap">
          {log.actor_name}
        </p>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {ROLE_LABELS[log.actor_role] ||
            toTitleCase(log.actor_role)}
          {ip ? ` · ${ip}` : ""}
        </p>
      </td>
      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
        <p className="font-medium text-foreground">
          {createdPosting ? `Created internship post: ${metadata.position}` : activityActionLabel(log.action)}
        </p>
        {description && !createdPosting && (
          <p className="whitespace-nowrap text-xs text-muted-foreground">
            {description}
          </p>
        )}
        {updatedFields.length > 0 && (
          <details className="mt-1.5 text-xs">
            <summary className="w-fit cursor-pointer font-semibold text-primary-emphasis">View update details</summary>
            <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/40 p-2.5">
              <p className="break-words whitespace-pre-wrap text-foreground">{description}</p>
              <p className="font-semibold text-foreground-soft">Fields included in the update</p>
              <ul className="list-disc space-y-1 pl-4 text-foreground">{updatedFields.map(label => <li key={label}>{label}</li>)}</ul>
            </div>
          </details>
        )}
        {!createdPosting && !updatedFields.length && description.length > 180 && <details className="mt-1.5 text-xs"><summary className="w-fit cursor-pointer font-semibold text-primary-emphasis">View full description</summary><p className="mt-2 break-words whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-2.5 text-foreground">{description}</p></details>}
        {createdPosting && (
          <>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
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
        {activityModuleLabel(log.target_type)}
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
