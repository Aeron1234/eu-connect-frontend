"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { toastAndAction } from "@/lib/helpers";
import { summaryReportKeys, summaryReportsOptions } from "@/lib/cache/summary-reports-queries";
import { deleteSummaryReport } from "@/lib/server-actions/summary-reports-actions";

// Coordinate eligible internships, selected summary report and edit/delete state.
// Preserve internship selection across refreshes and refresh the list after confirmed deletion.
export default function useStudentSummaryReports() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const reports = useQuery({ ...summaryReportsOptions(user?.id), enabled: Boolean(user?.id) });
  const records = reports.data || [];
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Keep selection by internship identity across refreshes; fall back to the first
  // eligible record if the selected internship is no longer in the list.
  const record = records.find((item) => item.internship_id === selectedId) || records[0];
  const deleteMutation = useMutation({
    mutationFn: (internshipId) => toastAndAction({
      loadingLabel: "Deleting summary report...",
      successLabel: "Summary report deleted.",
      errorLabel: "Could not delete the report.",
      action: async (id) => {
        try {
          return await deleteSummaryReport(id);
        } catch {
          return { success: false, error: "Could not delete the report. Please try again." };
        }
      },
      args: [internshipId],
    }),
  });

  async function handleDelete() {
    if (!record) return;
    try {
      const result = await deleteMutation.mutateAsync(record.internship_id);
      setConfirmingDelete(false);
      // A resolved action can still report failure. Refresh the saved-report list and
      // leave edit mode only after a confirmed successful deletion.
      if (result?.success) {
        await queryClient.invalidateQueries({ queryKey: summaryReportKeys.list(user.id) });
        setEditing(false);
      }
    } catch {
      setConfirmingDelete(false);
    }
  }
  return {
    reports,
    records,
    record,
    setSelectedId,
    editing,
    setEditing,
    confirmingDelete,
    setConfirmingDelete,
    deleteMutation,
    handleDelete,
  };
}
