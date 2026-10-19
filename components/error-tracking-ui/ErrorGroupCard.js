"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Trash2 } from "lucide-react";
import { errorGroupOptions } from "@/lib/cache/error-tracking-queries";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorUI from "@/components/ui/ErrorUI";

function when(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function ErrorDetails({ fingerprint, userId, id }) {
  const query = useQuery({ ...errorGroupOptions(userId, fingerprint), enabled: Boolean(userId && fingerprint) });
  return (
    <section id={id} className="border-t border-border p-4 sm:p-5" aria-label="Error group details">
      <h3 className="text-sm font-semibold text-foreground">Recent occurrences</h3>
      <p className="mt-1 text-xs text-muted-foreground">Group {fingerprint.slice(0, 12)} · up to 25 latest occurrences</p>
      {query.isPending ? (
        <div className="mt-4 space-y-3" role="status" aria-label="Loading error details">
          {Array.from({ length: 2 }, (_, index) => <Skeleton key={index} className="h-24 w-full rounded-lg" />)}
        </div>
      ) : (
        <>
        {query.isError && <ErrorUI error={query.error} reset={() => void query.refetch()} compact logError={false} />}
        {query.data && (
        <div className="mt-4 space-y-3">
          <p className="text-xs text-muted-foreground">{query.data.count} occurrence{query.data.count === 1 ? "" : "s"} · first seen {when(query.data.first_seen)} · last seen {when(query.data.last_seen)}</p>
          {query.data.occurrences.map(item => (
            <div key={item.id} className="min-w-0 rounded-lg border border-border bg-muted/20 p-3 text-xs sm:p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-medium text-foreground">
                <span>{when(item.created_at)}</span>
                <span>{item.status_code || item.source}</span>
                {item.method && <span className="break-all">{item.method} {item.route_pattern}</span>}
              </div>
              <p className="mt-2 break-words text-foreground-soft">{item.message}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                {item.error_code && <span>Code: {item.error_code}</span>}
                {item.code_location && <span className="break-all">Location: {item.code_location}</span>}
                {item.request_id && <span className="break-all">Request ID: {item.request_id}</span>}
                {item.actor_role && <span>Role: {item.actor_role}</span>}
                {item.actor_id && <span className="break-all">User ID: {item.actor_id}</span>}
              </div>
            </div>
          ))}
        </div>
        )}
        </>
      )}
    </section>
  );
}

export default function ErrorGroupCard({ item, userId, expanded, onToggle, onDelete, deleting }) {
  const detailsId = `error-details-${item.fingerprint}`;
  const label = item.route_pattern || item.source;
  return (
    <article className={`overflow-hidden rounded-xl border bg-card shadow-sm transition-colors ${expanded ? "border-primary" : "border-border hover:border-primary/50"}`}>
      <div className="flex items-start">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className="min-w-0 flex-1 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-primary/10 px-2 py-1 text-primary-emphasis">{item.status_code || item.source}</span>
              {item.method && <span className="rounded-full bg-muted px-2 py-1 text-foreground-soft">{item.method}</span>}
              <span className="text-muted-foreground">{item.occurrences} time{item.occurrences === 1 ? "" : "s"}</span>
            </div>
            <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
          <p className="mt-2 break-all text-sm font-semibold text-foreground">{label}</p>
          <p className="mt-1 line-clamp-2 break-words text-xs text-foreground-soft sm:text-sm">{item.context ? `${item.context} — ` : ""}{item.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">Last seen {when(item.last_seen)}{item.error_code ? ` · ${item.error_code}` : ""}</p>
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={deleting}
          aria-label={`Delete error group for ${item.method ? item.method + " " : ""}${label}`}
          title="Delete error group"
          className="mr-3 mt-4 shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:mr-4 sm:mt-5"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {expanded && <ErrorDetails id={detailsId} fingerprint={item.fingerprint} userId={userId} />}
    </article>
  );
}
