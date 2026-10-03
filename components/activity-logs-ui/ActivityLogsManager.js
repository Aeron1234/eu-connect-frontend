"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Activity, Layers3, ScrollText, Trash2, Users } from "lucide-react";
import {
  getAllActivityLogs,
  deleteActivityLog,
} from "@/lib/server-actions/activity-logs-actions";
import SearchBar from "../ui/SearchBar";
import PageTitle from "../ui/PageTitle";
import DropdownFilter from "../ui/DropdownFilter";
import Modal from "../ui/Modal";
import DeleteForm from "../ui/DeleteForm";
import { toastAndAction } from "../../lib/helpers";
import ActivityLogsTableSkeleton from "../skeletons/ActivityLogsTableSkeleton";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

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
function getMetadataIp(metadata) {
  if (!metadata) return null;
  try {
    const parsed =
      typeof metadata === "string" ? JSON.parse(metadata) : metadata;
    return parsed?.ip_address || parsed?.ip || null;
  } catch {
    return null;
  }
}

export default function ActivityLogsManager({
  initialData = [],
  initialStats = {},
  filters: initialFilters = { actions: [], actorRoles: [], targetTypes: [] },
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  } = {},
}) {
  const [isLoading, startTransition] = useTransition();
  const [logs, setLogs] = useState(initialData);
  const [filterOptions] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [stats, setStats] = useState(initialStats);

  const [actorRole, setActorRole] = useState("");
  const [targetType, setTargetType] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

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

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setIsPending(true);

    const timeout = setTimeout(async () => {
      try {
        const newData = await getAllActivityLogs({
          actorRole,
          targetType,
          search: query,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (!hasValidPage(newData, "data")) {
          console.error(
            "Error loading activity logs:",
            newData?.error || "Invalid response from the server",
          );
          return;
        }

        setLogs(newData.data);
        setCurrentPage(1);
        setTotalPages(newData?.pagination?.totalPages || 1);
        setTotal(newData?.pagination?.total || 0);
        setStats(newData.stats);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading activity logs:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [actorRole, targetType, query]);

  async function handleSeeMore() {
    if (isPending || currentPage >= totalPages) return;
    setIsPending(true);
    const nextPage = currentPage + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getAllActivityLogs({
        actorRole,
        targetType,
        search: query,
        page: nextPage,
      });

      if (thisRequestId !== requestIdRef.current) return;

      if (!hasValidPage(newData, "data", "pagination", nextPage)) {
        console.error(
          "Error loading more activity logs:",
          newData?.error || "Invalid response from the server",
        );
        return;
      }

      const incoming = newData.data;

      setLogs((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const filteredNew = incoming.filter((l) => !existingIds.has(l.id));
        return [...prev, ...filteredNew];
      });

      setCurrentPage(nextPage);
      setTotal(newData.pagination.total || 0);
      if (newData?.pagination?.totalPages) {
        setTotalPages(newData.pagination.totalPages);
      }
      setStats(newData.stats);
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more activity logs:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  async function handleDelete(formData) {
    const logId = formData.get("logId");
    const previousLogs = logs;

    // Optimistically remove immediately
    setLogs((prev) => prev.filter((l) => String(l.id) !== String(logId)));
    setTotal((prev) => Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Deleting log entry...",
        successLabel: "Log entry deleted.",
        errorLabel: "Failed to delete.",
        action: deleteActivityLog,
        formData,
      });

      if (!result?.success) {
        // Roll back on failure
        setLogs(previousLogs);
        setTotal((prev) => prev + 1);
        return;
      }

      // Deleting a row shifts every later offset page. Reload the first page
      // before allowing another See more request.
      const thisRequestId = ++requestIdRef.current;
      setIsPending(true);
      try {
        const fresh = await getAllActivityLogs({
          actorRole,
          targetType,
          search: query,
          page: 1,
        });
        if (thisRequestId !== requestIdRef.current) return;
        if (!hasValidPage(fresh, "data")) {
          console.error(
            "Error refreshing activity logs:",
            fresh?.error || "Invalid response from the server",
          );
          return;
        }
        setLogs(fresh.data);
        setCurrentPage(1);
        setTotalPages(fresh.pagination.totalPages || 1);
        setTotal(fresh.pagination.total || 0);
        setStats(fresh.stats);
      } catch (error) {
        if (thisRequestId === requestIdRef.current)
          console.error("Error refreshing activity logs:", error);
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by description..."
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <DropdownFilter
            value={actorRole}
            onValueChange={setActorRole}
            options={actorRoleOptions}
            placeholder="Role"
            className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
          />
          <DropdownFilter
            value={targetType}
            onValueChange={setTargetType}
            options={targetTypeOptions}
            placeholder="Module"
            className="bg-card p-2 flex-1 sm:flex-0 rounded-md"
          />
        </div>
      </div>

      {/* Table */}
      {logs.length === 0 && !isPending ? (
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
          {isPending && logs.length === 0 ? (
            <ActivityLogsTableSkeleton />
          ) : (
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
                  const ip = getMetadataIp(log.metadata);
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
                          {toSentenceCase(log.action)}
                        </p>
                        {log.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {log.description}
                          </p>
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
                              Delete Daily Time Record
                            </span>
                          }
                          // title={<span className="text-red-600">Clock-out?</span>}
                          description={`Are you sure you want to delete this activity log entry?`}
                        >
                          <DeleteForm
                            handleAction={handleDelete}
                            id={log.id}
                            isPending={isLoading}
                            name={"logId"}
                          />
                        </Modal>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {currentPage < totalPages && (
        <div className="text-center">
          <button
            type="button"
            onClick={handleSeeMore}
            disabled={isPending}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </main>
  );
}
