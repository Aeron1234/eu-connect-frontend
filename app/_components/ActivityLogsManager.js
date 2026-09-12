"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, ScrollText, Trash2 } from "lucide-react";
import {
  getAllActivityLogs,
  deleteActivityLog,
} from "@/app/_services/admin-actions";
import SearchBar from "./SearchBar";
import PageTitle from "./PageTitle";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

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
  filters: initialFilters = { actions: [], actorRoles: [], targetTypes: [] },
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  } = {},
}) {
  const [logs, setLogs] = useState(initialData);
  const [filterOptions] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);

  const [actorRole, setActorRole] = useState("");
  const [targetType, setTargetType] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const newData = await getAllActivityLogs({
          actorRole,
          targetType,
          search: query,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error("Error loading activity logs:", newData.error);
          setLogs([]);
          setTotalPages(1);
          setTotal(0);
          setCurrentPage(1);
          return;
        }

        setLogs(newData?.data || []);
        setCurrentPage(1);
        setTotalPages(newData?.pagination?.totalPages || 1);
        setTotal(newData?.pagination?.total || 0);
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

      if (newData?.error) {
        console.error("Error loading more activity logs:", newData.error);
        return;
      }

      const incoming = newData?.data || [];

      setLogs((prev) => {
        const existingIds = new Set(prev.map((l) => l.id));
        const filteredNew = incoming.filter((l) => !existingIds.has(l.id));
        return [...prev, ...filteredNew];
      });

      setCurrentPage(nextPage);
      if (newData?.pagination?.totalPages) {
        setTotalPages(newData.pagination.totalPages);
      }
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more activity logs:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  async function handleDelete(logId) {
    const result = await deleteActivityLog(logId);
    if (result?.error) {
      console.error(result.error);
      return;
    }
    setLogs((prev) => prev.filter((l) => l.id !== logId));
    setTotal((prev) => Math.max(0, prev - 1));
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-6">
      {/* Header — no export button */}
      <PageTitle
        Icon={Activity}
        title={"Activity Logs"}
        description={
          "Audit every action taken across EU-Connect — logins, approvals, uploads, and administrative changes."
        }
      />

      <div className="w-full items-start">
        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by description..."
        />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActorRole("")}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                !actorRole
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              All Roles
            </button>
            {filterOptions.actorRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setActorRole(role)}
                className={cx(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  actorRole === role
                    ? "bg-primary-500 text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {ROLE_LABELS[role] || toTitleCase(role)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTargetType("")}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                !targetType
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              All Modules
            </button>
            {filterOptions.targetTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTargetType(type)}
                className={cx(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  targetType === type
                    ? "bg-primary-500 text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {toTitleCase(type)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {logs.length === 0 && !isPending ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-24 text-center shadow-sm">
          <ScrollText className="size-8 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            No activity found
          </p>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground/70">
            Try a different filter or clear the search.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Action</th>
                <th className="px-5 py-3 font-medium">Module</th>
                <th className="px-5 py-3 font-medium">Timestamp</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
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
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">
                        {log.actor_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ROLE_LABELS[log.actor_role] ||
                          toTitleCase(log.actor_role)}
                        {ip ? ` · ${ip}` : ""}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">
                        {toSentenceCase(log.action)}
                      </p>
                      {log.description && (
                        <p className="text-xs text-muted-foreground">
                          {log.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {toTitleCase(log.target_type)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(log.id)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                        title="Delete log entry"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {currentPage < totalPages && (
        <div className="text-center">
          <button
            onClick={handleSeeMore}
            disabled={isPending}
            className="text-sm font-semibold text-stone-600 hover:text-primary-500 transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </main>
  );
}
