"use client";

import { notifyReadError } from "@/lib/client-read-error";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { activityLogsInfiniteOptions, activityLogsKeys } from "@/lib/cache/activity-logs-queries";
import { deleteActivityLog, deleteActivityLogsByDateRange } from "@/lib/server-actions/activity-logs-actions";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { toastAndAction } from "../../lib/helpers";
import { canKeepLoadedPages, hasValidPage } from "@/lib/see-more-pagination.mjs";
import { ROLE_LABELS, toTitleCase, activityModuleLabel } from "./activityLogFormatting";

const defaultFilters = { actorRole: "", targetType: "", search: "" };
const emptyFilterOptions = { actions: [], actorRoles: [], targetTypes: [] };

// Coordinate filtered log pages, summary/filter choices and deletion controls.
// Return view props and handlers; deletion must reconcile offset pages across variants.
export default function useActivityLogsManager(initialPage) {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialPage);
  const [isDeletingOne, startTransition] = useTransition();
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const batchDeletingRef = useRef(false);
  const isDeleting = isDeletingOne || isBatchDeleting;
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
      label: activityModuleLabel(type),
    })),
  ];

  function handleSeeMore() {
    if (!isFiltering && !isDeleting && !logsQuery.isFetching && logsQuery.hasNextPage) {
      void logsQuery.fetchNextPage();
    }
  }

  async function handleDelete(formData) {
    if (isDeleting || batchDeletingRef.current) return;
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
        args: [formData],
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

  async function handleBatchDelete(range) {
    if (isDeleting || batchDeletingRef.current) return;
    batchDeletingRef.current = true;
    setIsBatchDeleting(true);
    const queryKey = activityLogsKeys.all(userId);
    try {
      await queryClient.cancelQueries({ queryKey });
      const result = await toastAndAction({
        loadingLabel: "Deleting activity logs...",
        successLabel: "Activity logs deleted.",
        errorLabel: "Failed to delete activity logs.",
        action: deleteActivityLogsByDateRange,
        args: [{ fromDate: range.fromDate, throughDate: range.throughDate }],
      });
      if (!result?.success) return result;
      // Rows shift across every cached filter and offset page after deletion.
      await queryClient.cancelQueries({ queryKey });
      queryClient.setQueriesData({ queryKey }, (old) => old?.pages?.length
        ? { pages: [old.pages[0]], pageParams: [1] }
        : old);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.all(userId) }),
      ]);
      return result;
    } catch {
      // toastAndAction already reports unexpected mutation failures.
      return { success: false };
    } finally {
      batchDeletingRef.current = false;
      setIsBatchDeleting(false);
    }
  }

  return {
    logsQuery,
    logs,
    stats,
    total,
    isFiltering,
    isChangingFilters,
    isDeleting,
    isBatchDeleting,
    handleBatchDelete,
    query,
    setQuery,
    actorRole,
    setActorRole,
    targetType,
    setTargetType,
    actorRoleOptions,
    targetTypeOptions,
    showCachedFilters,
    handleSeeMore,
    handleDelete,
  };
}
