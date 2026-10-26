"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { canKeepLoadedPages } from "@/lib/see-more-pagination.mjs";
import { internshipRecordsInfiniteOptions, internshipRecordsKeys } from "@/lib/cache/internship-records-queries";
import { mapLocationsKeys } from "@/lib/cache/map-locations-queries";
import { dashboardOverviewKeys } from "@/lib/cache/dashboard-overview-queries";
import { toastAndAction } from "@/lib/helpers";
import { updateInternshipRecordStatus } from "@/lib/server-actions/internship-records-actions";

export default function useRecordsList({
  initialData,
  filter: initialFilter = "all",
  pagination: {
    page: initialPage = 1,
    limit = 10,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 0,
  } = {},
  stats: initialStats = {},
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const [criteria, setCriteria] = useState({
    status: initialFilter === "all" ? "" : initialFilter,
    search: "",
    limit,
  });
  const [isPending, startTransition] = useTransition();
  const [confirmation, setConfirmation] = useState(null);
  const { user } = useUser();
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialData);
  const seedCriteria = useMemo(
    () => ({ status: "", search: "", limit }),
    [limit],
  );
  const statusParam = filter === "all" ? "" : filter;

  useEffect(() => {
    const timeout = setTimeout(
      () => setCriteria({ status: statusParam, search: query, limit }),
      500,
    );
    return () => clearTimeout(timeout);
  }, [query, statusParam, limit]);

  // Keep actions disabled while the visible filter/search is ahead of the debounced
  // query, including when the query temporarily shows results from previous criteria.
  const isChangingCriteria =
    criteria.status !== statusParam ||
    criteria.search !== query ||
    criteria.limit !== limit;
  const recordsQuery = useInfiniteQuery({
    ...internshipRecordsInfiniteOptions(user.id, criteria),
    initialData:
      Array.isArray(initialData) &&
      initialFilter === "all" &&
      criteria.status === "" &&
      criteria.search === "" &&
      criteria.limit === limit
        ? {
            pages: [
              {
                data: initialData,
                stats: initialStats,
                pagination: {
                  page: initialPage,
                  limit,
                  total: initialTotal,
                  totalPages: initialTotalPages,
                },
              },
            ],
            pageParams: [1],
          }
        : undefined,
  });

  const records = useMemo(() => {
    const seen = new Set();
    return (recordsQuery.data?.pages ?? []).flatMap((page) =>
      page.data.filter((record) => {
        if (seen.has(record.id)) return false;
        seen.add(record.id);
        return true;
      }),
    );
  }, [recordsQuery.data]);
  const total = recordsQuery.data?.pages[0]?.pagination?.total ?? initialTotal;
  const stats = recordsQuery.data?.pages[0]?.stats ?? initialStats;
  const isLoadingMore = recordsQuery.isFetchingNextPage;
  const isSearching =
    isChangingCriteria ||
    recordsQuery.isPending ||
    recordsQuery.isPlaceholderData;

  useEffect(() => {
    if (recordsQuery.error && recordsQuery.data) {
      notifyReadError("Error loading internship records:", recordsQuery.error);
    }
  }, [recordsQuery.error, recordsQuery.data]);

  useEffect(() => {
    if (!Array.isArray(initialData) || serverSnapshotRef.current === initialData) return;
    serverSnapshotRef.current = initialData;
    queryClient.setQueryData(
      internshipRecordsKeys.list(user.id, seedCriteria),
      (old) => {
        if (!old?.pages?.length) return old;
        const previous = old.pages[0];
        const keepLoaded = canKeepLoadedPages(
          previous.data.map((record) => record.id),
          previous.pagination.total,
          initialData,
          initialTotal,
        );
        const firstPage = {
          data: initialData,
          stats: initialStats,
          pagination: {
            page: initialPage,
            limit,
            total: initialTotal,
            totalPages: initialTotalPages,
          },
        };
        return {
          pages: keepLoaded ? [firstPage, ...old.pages.slice(1)] : [firstPage],
          pageParams: keepLoaded ? old.pageParams : [1],
        };
      },
    );
  }, [
    initialData,
    initialPage,
    initialStats,
    initialTotal,
    initialTotalPages,
    limit,
    queryClient,
    seedCriteria,
    user.id,
  ]);

  function handleStatus(internshipId, status) {
    setConfirmation(null);
    const formData = new FormData();
    formData.append("id", internshipId);
    formData.append("status", status);

    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Updating record...",
        successLabel: "Record updated.",
        errorLabel: "Failed to update record.",
        action: updateInternshipRecordStatus,
        args: [formData],
      });

      // Only confirmed transitions update the cached status. Drop later pages and
      // refetch all list variants because membership, ordering and totals may have changed.
      if (result?.success) {
        queryClient.setQueryData(
          internshipRecordsKeys.list(user.id, criteria),
          (old) =>
            old?.pages?.length
              ? {
                  pages: [
                    {
                      ...old.pages[0],
                      data: old.pages[0].data.map((record) =>
                        record.id === internshipId
                          ? { ...record, status }
                          : record,
                      ),
                    },
                  ],
                  pageParams: [1],
                }
              : old,
        );
        await queryClient.invalidateQueries({
          queryKey: internshipRecordsKeys.all(user.id),
        });
        void queryClient.invalidateQueries({ queryKey: mapLocationsKeys.all(user.id) });
        void queryClient.invalidateQueries({ queryKey: dashboardOverviewKeys.role(user.id, user.role) });
      }
    });
  }

  return {
    recordsQuery, query, setQuery, filter, setFilter, stats, total,
    records, isSearching, isLoadingMore,
    cardProps: { isPending, isSearching, setConfirmation },
    confirmationProps: {
      open: Boolean(confirmation),
      onOpenChange: (open) => {
        if (!open) setConfirmation(null);
      },
      title: `${confirmation?.label || "Update"} internship record?`,
      description: confirmation ? `This will change ${confirmation.studentName}'s internship status.` : "",
      confirmLabel: confirmation?.label || "Confirm",
      destructive: confirmation?.status === "rejected",
      intent: confirmation?.status === "rejected" ? "decline" : confirmation?.status === "ongoing" ? "approve" : confirmation?.status === "finished" ? "complete" : "restore",
      pending: isPending,
      onConfirm: () => confirmation && handleStatus(confirmation.id, confirmation.status),
    },
  };
}
