"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { toastAndAction } from "@/lib/helpers";
import { summaryReportKeys, summaryReportsOptions } from "@/lib/cache/summary-reports-queries";
import { deleteSummaryReport } from "@/lib/server-actions/summary-reports-actions";

export default function useStudentSummaryReports() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const reports = useQuery({ ...summaryReportsOptions(user?.id), enabled: Boolean(user?.id) });
  const records = reports.data || [];
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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
      id: internshipId,
    }),
  });

  async function handleDelete() {
    if (!record) return;
    try {
      const result = await deleteMutation.mutateAsync(record.internship_id);
      setConfirmingDelete(false);
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
