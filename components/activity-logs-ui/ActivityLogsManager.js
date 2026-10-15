"use client";

import { notifyReadError } from "@/lib/client-read-error";
import ErrorUI from "@/components/ui/ErrorUI";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, Layers3, ScrollText, Trash2, TriangleAlert, Users } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { activityLogsInfiniteOptions, activityLogsKeys } from "@/lib/cache/activity-logs-queries";
import { deleteActivityLog } from "@/lib/server-actions/activity-logs-actions";
import SearchBar from "../ui/SearchBar";
import PageTitle from "../ui/PageTitle";
import PageManual from "../ui/PageManual";
import DropdownFilter from "../ui/DropdownFilter";
import Modal from "../ui/Modal";
import DeleteForm from "../ui/DeleteForm";
import { toastAndAction } from "../../lib/helpers";
import ActivityLogsTableSkeleton from "../skeletons/ActivityLogsTableSkeleton";
import { canKeepLoadedPages, hasValidPage } from "@/lib/see-more-pagination.mjs";

const ROLE_LABELS = {
  student: "Student",
  employer: "Employer",
  department_head: "Dept. Head",
  admin: "Admin",
};

// "failed_login_attempt" -> "Failed login attempt" — sentence case, matches
// how actions read naturally as a phrase, not each-word-capitalized.
function toSentenceCase(str) {
  if (!str) return "";
  const spaced = str.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

// "internship_records" -> "Internship Records" — title case, matches how
// module/category names read as labels, not sentences.
function toTitleCase(str) {
  if (!str) return "";
  return str
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function formatTimestamp(dateStr) {
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// metadata is stored as a longtext column — may or may not be valid JSON,
// may or may not contain an ip. Never assume; parse defensively and only
// render what's actually there.
function parseMetadata(metadata) {
  if (!metadata) return null;
  try {
    const parsed = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

const POSTING_DETAIL_FIELDS = [
  ["company_name", "Company"],
  ["position", "Position title"],
  ["vacancies", "Vacancies"],
  ["location", "Location"],
  ["work_type", "Work type"],
  ["duration_hours", "Duration (hours)"],
  ["description", "Description"],
  ["requirements", "Requirements"],
  ["contact_name", "Contact person"],
  ["contact_email", "Contact email"],
  ["contact_phone", "Contact phone"],
  ["contact_website", "Contact website"],
  ["eligible_courses", "Eligible courses"],
];

function postingDetails(metadata) {
  if (!metadata) return [];
  const fields = POSTING_DETAIL_FIELDS.filter(([key]) => metadata[key] != null && metadata[key] !== "");
  if (!metadata.eligible_courses && Array.isArray(metadata.course_ids)) {
    fields.push(["course_ids", "Eligible course IDs"]);
  }
  return fields.map(([key, label]) => [label, Array.isArray(metadata[key]) ? metadata[key].join(", ") : String(metadata[key])]);
}

const defaultFilters = { actorRole: "", targetType: "", search: "" };
const emptyFilterOptions = { actions: [], actorRoles: [], targetTypes: [] };

export default function ActivityLogsManager({ initialPage }) {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialPage);
  const [isDeleting, startTransition] = useTransition();
  const [actorRole, setActorRole] = useState("");
  const [targetType, setTargetType] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    const timeout = setTimeout(() => setFilters({
      actorRole,
      targetType,
      search: query.trim(),
    }), 500);
    return () => clearTimeout(timeout);
  }, [actorRole, targetType, query]);

  const isChangingFilters =
    filters.actorRole !== actorRole ||
    filters.targetType !== targetType ||
    filters.search !== query.trim();
  const logsQuery = useInfiniteQuery({
    ...activityLogsInfiniteOptions(userId, filters),
    enabled: Boolean(userId),
    initialData: !filters.actorRole && !filters.targetType && !filters.search &&
      hasValidPage(initialPage, "data")
      ? { pages: [initialPage], pageParams: [1] }
      : undefined,
  });
  const logs = useMemo(() => {
    const seen = new Set();
    return (logsQuery.data?.pages || []).flatMap((page) =>
      page.data.filter((log) => {
        if (seen.has(log.id)) return false;
        seen.add(log.id);
        return true;
      }),
    );
  }, [logsQuery.data]);
  const firstPage = logsQuery.data?.pages[0];
  const filterOptions = firstPage?.filters ?? initialPage?.filters ?? emptyFilterOptions;
  const stats = firstPage?.stats ?? {};
  const total = firstPage?.pagination.total ?? 0;
  const isFiltering = isChangingFilters || logsQuery.isPending || logsQuery.isPlaceholderData;

  function showCachedFilters(nextFilters) {
    if (userId && queryClient.getQueryData(activityLogsKeys.list(userId, nextFilters))?.pages?.length) {
      setFilters(nextFilters);
    }
  }

  useEffect(() => {
    if (!isChangingFilters && logsQuery.error && logsQuery.data) {
      notifyReadError("Error loading activity logs:", logsQuery.error);
    }
  }, [isChangingFilters, logsQuery.error, logsQuery.data]);

  // A server action can stream a fresh first page without remounting the list.
  useEffect(() => {
    if (!initialPage || serverSnapshotRef.current === initialPage || !userId) return;
    serverSnapshotRef.current = initialPage;
    queryClient.setQueryData(activityLogsKeys.list(userId, defaultFilters), (old) => {
      if (!old?.pages?.length) return { pages: [initialPage], pageParams: [1] };
      const previous = old.pages[0];
      const keepLoaded = canKeepLoadedPages(
        previous.data.map((log) => log.id),
        previous.pagination.total,
        initialPage.data,
        initialPage.pagination.total,
      );
      return {
        pages: keepLoaded ? [initialPage, ...old.pages.slice(1)] : [initialPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialPage, queryClient, userId]);

  const actorRoleOptions = [
    { value: "", label: "All Roles" },
    ...filterOptions.actorRoles.map((role) => ({
      value: role,
      label: ROLE_LABELS[role] || toTitleCase(role),
    })),
  ];

  const targetTypeOptions = [
    { value: "", label: "All Modules" },
    ...filterOptions.targetTypes.map((type) => ({
      value: type,
      label: toTitleCase(type),
    })),
  ];

  function handleSeeMore() {
    if (!isFiltering && !isDeleting && !logsQuery.isFetching && logsQuery.hasNextPage) {
      void logsQuery.fetchNextPage();
    }
  }

  async function handleDelete(formData) {
    const logId = formData.get("logId");
    startTransition(async () => {
      const queryKey = activityLogsKeys.all(userId);
      await queryClient.cancelQueries({ queryKey });
      const previousQueries = queryClient.getQueriesData({ queryKey });

      // Keep the immediate removal, including if this log appears in another cached filter.
      queryClient.setQueriesData({ queryKey }, (old) => {
        if (!old?.pages?.length) return old;
        if (!old.pages.some((page) => page.data.some((log) => String(log.id) === String(logId)))) {
          return old;
        }
        const total = Math.max(0, Number(old.pages[0].pagination.total) - 1);
        return {
          ...old,
          pages: old.pages.map((page) => {
            const data = page.data.filter((log) => String(log.id) !== String(logId));
            return {
              ...page,
              data,
              pagination: {
                ...page.pagination,
                total,
                totalPages: Math.ceil(total / page.pagination.limit),
              },
            };
          }),
        };
      });

      const result = await toastAndAction({
        loadingLabel: "Deleting log entry...",
        successLabel: "Log entry deleted.",
        errorLabel: "Failed to delete.",
        action: deleteActivityLog,
        formData,
      });

      if (!result?.success) {
        for (const [key, data] of previousQueries) queryClient.setQueryData(key, data);
        return;
      }

      // Deleting shifts offset pages. Keep only page one before any next-page request.
      queryClient.setQueriesData({ queryKey }, (old) => old?.pages?.length
        ? { pages: [old.pages[0]], pageParams: [1] }
        : old);
      await queryClient.invalidateQueries({ queryKey });
    });
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      <PageTitle
        Icon={Activity}
        title={"Activity Logs"}
        description={
          "Audit every action taken across EU-Connect — logins, approvals, uploads, and administrative changes."
        }
        titleAction={<PageManual page="admin-activity-logs" />}
      />

      <section aria-label="Activity summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total events", value: total.toLocaleString(), detail: "Matching activity logs", Icon: Activity },
          { label: "Active users", value: Number(stats?.activeUsers || 0).toLocaleString(), detail: "Unique users in these logs", Icon: Users },
          { label: "Most common action", value: toSentenceCase(stats?.mostCommonAction?.name) || "None", detail: stats?.mostCommonAction ? `${Number(stats.mostCommonAction.count).toLocaleString()} events` : "No matching activity", Icon: ScrollText },
          { label: "Most active module", value: toTitleCase(stats?.mostActiveModule?.name) || "None", detail: stats?.mostActiveModule ? `${Number(stats.mostActiveModule.count).toLocaleString()} events` : "No matching activity", Icon: Layers3 },
        ].map(({ label, value, detail, Icon }) => (
          <div key={label} className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-sm text-foreground-soft">
              <Icon className="size-4 text-primary-emphasis" aria-hidden="true" />
              <span>{label}</span>
            </div>
            <p className="mt-3 truncate text-xl font-semibold text-foreground" title={String(value)}>{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </div>
        ))}
      </section>

      {/* Filters */}
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={(e) => {
              const search = e.target.value;
              setQuery(search);
              showCachedFilters({ actorRole, targetType, search: search.trim() });
            }}
            placeholder="Search by description..."
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <DropdownFilter
            value={actorRole}
            onValueChange={(nextRole) => {
              setActorRole(nextRole);
              showCachedFilters({ actorRole: nextRole, targetType, search: query.trim() });
            }}
            options={actorRoleOptions}
            placeholder="Role"
            className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
          />
          <DropdownFilter
            value={targetType}
            onValueChange={(nextType) => {
              setTargetType(nextType);
              showCachedFilters({ actorRole, targetType: nextType, search: query.trim() });
            }}
            options={targetTypeOptions}
            placeholder="Module"
            className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
          />
        </div>
      </div>

      {/* Table */}
      {!isChangingFilters && logsQuery.error && logsQuery.data && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
          <span className="flex items-center gap-2 text-foreground-soft">
            <TriangleAlert className="size-4 text-destructive" aria-hidden="true" />
            {logsQuery.error.message || "Activity logs could not be updated."}
          </span>
          <button
            type="button"
            onClick={() => logsQuery.isFetchNextPageError ? logsQuery.fetchNextPage() : logsQuery.refetch()}
            className="font-semibold text-primary-emphasis hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {isFiltering ? (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <ActivityLogsTableSkeleton />
        </div>
      ) : logsQuery.error && !logsQuery.data ? (
        <ErrorUI error={logsQuery.error} reset={() => void logsQuery.refetch()} logError={false} />
      ) : logsQuery.error && logs.length === 0 ? null : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-24 text-center shadow-sm">
          <ScrollText className="size-8 text-foreground-faint" />
          <p className="text-sm font-medium text-muted-foreground">
            No activity found
          </p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different filter or clear the search.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 sm:px-5 py-3 font-medium">User</th>
                  <th className="px-4 sm:px-5 py-3 font-medium">Action</th>
                  <th className="px-4 sm:px-5 py-3 font-medium">Module</th>
                  <th className="px-4 sm:px-5 py-3 font-medium whitespace-nowrap">
                    Timestamp
                  </th>
                  <th className="px-4 sm:px-5 py-3 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
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
                        <Modal
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
                          // title={<span className="text-red-600">Clock-out?</span>}
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
                })}
              </tbody>
            </table>
        </div>
      )}

      {!isFiltering && logsQuery.hasNextPage && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleSeeMore}
            disabled={isDeleting || logsQuery.isFetching}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {logsQuery.isFetchingNextPage ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </main>
  );
}
