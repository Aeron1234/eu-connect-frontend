"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notifyReadError } from "@/lib/client-read-error";
import { evaluationsKeys } from "@/lib/cache/evaluations-queries";
import { userProfileKeys, userProfileTabOptions } from "@/lib/cache/user-profile-queries";
import { buildTabs } from "./profileTabs";

// Coordinate permitted profile tabs, delayed reads and child mutation refresh handlers.
// Server-provided department/supervision access constrains which private caches can be used.
export default function useSearchedUserTabs({
  searchedUserId, userId, userRole, searchedUserRole, hasOngoingInternship,
  defaultFilter, initialDtrData, initialDtrLocation, supervision, canViewStudentRecords,
}) {
  const tabs = buildTabs({ userRole, searchedUserRole, supervision, hasOngoingInternship, canViewStudentRecords });
  // Heads require a positive server permission for student records. Missing permission
  // fails closed, and stale requested/loaded tabs are clamped to the available list.
  const restricted = userRole === "department_head" && searchedUserRole === "student" && canViewStudentRecords !== true;
  const hideTabs = searchedUserRole === "student" && !hasOngoingInternship;

  const safeDefaultFilter = tabs.some((tab) => tab.value === defaultFilter)
    ? defaultFilter
    : "info";

  const queryClient = useQueryClient();
  const [requestedTab, setSelectedTab] = useState(safeDefaultFilter);
  const [loadedTab, setActiveTab] = useState(safeDefaultFilter);
  const [dtrPage, setDtrPage] = useState(1);
  const selectedTab = tabs.some(tab => tab.value === requestedTab) ? requestedTab : "info";
  const activeTab = tabs.some(tab => tab.value === loadedTab) ? loadedTab : "info";
  const tabQuery = useQuery({
    ...userProfileTabOptions(
      userId,
      searchedUserId,
      activeTab,
      dtrPage,
      userRole,
    ),
    enabled: activeTab !== "info" && Boolean(userId && searchedUserId),
    initialData:
      activeTab === "dtr" && dtrPage === 1 && initialDtrData
        ? { dtrData: initialDtrData, dtrLocation: initialDtrLocation }
        : undefined,
  });

  useEffect(() => {
    if (!restricted || !userId || !searchedUserId) return;
    // Remove this viewer/target's private query entries when access is restricted.
    // Cancellation/removal complements server authorization; it does not replace it.
    const filters = {
      queryKey: userProfileKeys.all(userId, searchedUserId),
      predicate: query => query.queryKey[3] !== "info",
    };
    void queryClient.cancelQueries(filters);
    queryClient.removeQueries(filters);
  }, [restricted, queryClient, userId, searchedUserId]);

  useEffect(() => {
    if (selectedTab === activeTab) return;
    const timeout = setTimeout(() => setActiveTab(selectedTab), 300);
    return () => clearTimeout(timeout);
  }, [selectedTab, activeTab]);

  useEffect(() => {
    if (tabQuery.error) {
      if (tabQuery.data) notifyReadError(tabQuery.error.message || "Could not load this section.");
    }
  }, [tabQuery.error, tabQuery.data]);

  useEffect(() => {
    if (restricted || !userId || !initialDtrData) return;
    queryClient.setQueryData(
      userProfileKeys.tab(userId, searchedUserId, "dtr", 1),
      { dtrData: initialDtrData, dtrLocation: initialDtrLocation },
    );
  }, [
    initialDtrData,
    initialDtrLocation,
    queryClient,
    searchedUserId,
    userId,
    restricted,
  ]);

  // Reject unavailable tabs. Cached allowed tabs switch immediately; uncached ones
  // use the delayed active-tab effect, with DTR returning to page one.
  function handleTabClick(value) {
    if (!tabs.some(tab => tab.value === value)) return;
    setSelectedTab(value);
    const page = value === "dtr" ? 1 : dtrPage;
    if (value === "dtr") {
      setDtrPage(1);
    }
    if (
      value === "info" ||
      queryClient.getQueryData(
        userProfileKeys.tab(userId, searchedUserId, value, page),
      )
    ) {
      setActiveTab(value);
    }
  }

  function handleDtrLocationSaved(saved) {
    queryClient.setQueriesData(
      { queryKey: userProfileKeys.dtrPages(userId, searchedUserId) },
      (previous) => previous && ({
        ...previous,
        dtrLocation: {
          internship_id: saved.internship_id,
          is_custom_location: saved.is_custom_location !== false,
          location: saved,
        },
      }),
    );
  }

  function refreshEvaluations() {
    void queryClient.invalidateQueries({
      queryKey: userProfileKeys.tab(userId, searchedUserId, "evaluations"),
    });
    void queryClient.invalidateQueries({
      queryKey: evaluationsKeys.all(userId),
    });
  }

  function refreshCertificates() {
    void queryClient.invalidateQueries({
      queryKey: userProfileKeys.tab(userId, searchedUserId, "certificates"),
    });
  }

  const isSwitching = selectedTab !== activeTab;
  const isPending = isSwitching || (activeTab !== "info" && tabQuery.isPending);
  const loadError = !isSwitching && tabQuery.isError && !tabQuery.data;
  const data = tabQuery.data;

  return {
    tabs, hideTabs, selectedTab, activeTab, dtrPage, setDtrPage,
    tabQuery, data, isPending, loadError, handleTabClick,
    handleDtrLocationSaved, refreshEvaluations, refreshCertificates,
  };
}
