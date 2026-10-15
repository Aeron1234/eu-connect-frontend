"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { internshipRecordDetailsKeys, internshipRecordDetailsTabOptions } from "@/lib/cache/internship-record-details-queries";

export default function useRecordDetailsTabs(record, internshipId) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [activeTab, setActiveTab] = useState("overview");
  const [dtrPage, setDtrPage] = useState(1);
  const tabQuery = useQuery({
    ...internshipRecordDetailsTabOptions(
      user?.id,
      internshipId,
      activeTab,
      record,
      dtrPage,
    ),
    enabled: activeTab !== "overview" && Boolean(user?.id && internshipId),
  });

  useEffect(() => {
    if (selectedTab === activeTab) return;
    const timeout = setTimeout(() => setActiveTab(selectedTab), 300);
    return () => clearTimeout(timeout);
  }, [selectedTab, activeTab]);

  useEffect(() => {
    if (tabQuery.error && tabQuery.data) notifyReadError(tabQuery.error.message || "Could not load this section.");
  }, [tabQuery.error, tabQuery.data]);

  function handleTabClick(value) {
    setSelectedTab(value);
    if (value === "dtr") setDtrPage(1);
    if (
      value === "overview" ||
      queryClient.getQueryData(
        internshipRecordDetailsKeys.tab(user?.id, internshipId, value, 1),
      )
    ) {
      setActiveTab(value);
    }
  }

  function handleDtrLocationSaved(saved) {
    queryClient.setQueriesData(
      { queryKey: internshipRecordDetailsKeys.dtrPages(user?.id, internshipId) },
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

  const isSwitching = selectedTab !== activeTab;
  const isPending =
    isSwitching || (activeTab !== "overview" && tabQuery.isPending);
  const loadError = !isSwitching && tabQuery.isError && !tabQuery.data;
  const data = tabQuery.data;

  const refreshEvaluations = () => void queryClient.invalidateQueries({
    queryKey: internshipRecordDetailsKeys.tab(user?.id, internshipId, "evaluations"),
  });
  return {
    selectedTab, activeTab, dtrPage, setDtrPage, tabQuery,
    data, isPending, loadError, handleTabClick,
    handleDtrLocationSaved, refreshEvaluations,
  };
}
