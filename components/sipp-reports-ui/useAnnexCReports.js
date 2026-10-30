"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { notifyReadError } from "@/lib/client-read-error";
import { toastAndAction } from "@/lib/helpers";
import { annexCReportsInfiniteOptions, sippReportsKeys } from "@/lib/cache/sipp-reports-queries";
import { canKeepLoadedPages, hasValidPage } from "@/lib/see-more-pagination.mjs";
import { saveAnnexCReport, deleteAnnexCReport } from "@/lib/server-actions/sipp-hte-actions";

const emptyRow = () => ({ issue: "", solution: "", recommendation: "" });

// Coordinate the Annex C editor, saved report pages and submission/deletion controls.
// Return grouped props while keeping local draft rows separate from cached saved reports.
export default function useAnnexCReports(initialPage) {
  const { user } = useUser();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const serverSnapshotRef = useRef(initialPage);
  const [tab, setTab] = useState(initialPage?.tab === 'reports' ? 'reports' : 'form');

  // Form values are local draft state; four starter rows are editable scaffolding,
  // not a requirement for four stored or printed entries.
  const [academicYear, setAcademicYear] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [rows, setRows] = useState([
    emptyRow(),
    emptyRow(),
    emptyRow(),
    emptyRow(),
  ]);
  const [preparedBy, setPreparedBy] = useState("");
  const [certifiedBy, setCertifiedBy] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingReportId, setEditingReportId] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  // Each year, status, and search combination has its own cached pages.
  const [reportsYear, setReportsYear] = useState(initialPage?.academicYear || "");
  const [reportsStatus, setReportsStatus] = useState(initialPage?.status || '');
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    academicYear: initialPage?.academicYear || "",
    status: initialPage?.status || '',
    search: "",
  });

  useEffect(() => {
    const timeout = setTimeout(() => setFilters({
      academicYear: reportsYear,
      status: reportsStatus,
      search: query.trim(),
    }), 500);
    return () => clearTimeout(timeout);
  }, [reportsYear, reportsStatus, query]);

  const isChangingFilters =
    filters.academicYear !== reportsYear ||
    filters.status !== reportsStatus ||
    filters.search !== query.trim();
  const reportsQuery = useInfiniteQuery({
    ...annexCReportsInfiniteOptions(userId, filters),
    enabled: Boolean(userId) && tab === "reports",
    initialData:
      filters.academicYear === (initialPage?.academicYear || "") &&
      !filters.status && !filters.search &&
      hasValidPage(initialPage, "reports")
        ? { pages: [initialPage], pageParams: [1] }
        : undefined,
  });
  const reports = useMemo(() => {
    const seen = new Set();
    return (reportsQuery.data?.pages || []).flatMap((page) =>
      page.reports.filter((report) => {
        if (seen.has(report.id)) return false;
        seen.add(report.id);
        return true;
      }),
    );
  }, [reportsQuery.data]);
  const availableYears = reportsQuery.data?.pages[0]?.availableYears ?? initialPage?.availableYears ?? [];
  const isPending = isChangingFilters || reportsQuery.isPending;

  function showCachedFilters(nextFilters) {
    if (userId && queryClient.getQueryData(sippReportsKeys.annexCList(userId, nextFilters))?.pages?.length) {
      setFilters(nextFilters);
    }
  }

  useEffect(() => {
    if (reportsQuery.error && reportsQuery.data) notifyReadError("Error loading Annex C reports:", reportsQuery.error);
  }, [reportsQuery.error, reportsQuery.data]);

  useEffect(() => {
    if (!initialPage || serverSnapshotRef.current === initialPage || !userId) return;
    serverSnapshotRef.current = initialPage;
    const seedFilters = { academicYear: initialPage.academicYear || "", status: "", search: "" };
    queryClient.setQueryData(sippReportsKeys.annexCList(userId, seedFilters), (old) => {
      if (!old?.pages?.length) return { pages: [initialPage], pageParams: [1] };
      const previous = old.pages[0];
      const keepLoaded = canKeepLoadedPages(
        previous.reports.map((report) => report.id),
        previous.pagination.total,
        initialPage.reports,
        initialPage.pagination.total,
      );
      return {
        pages: keepLoaded ? [initialPage, ...old.pages.slice(1)] : [initialPage],
        pageParams: keepLoaded ? old.pageParams : [1],
      };
    });
  }, [initialPage, queryClient, userId]);

  function refreshReportsCache(deletedId) {
    // A changed report can shift every later offset page in every filter variant.
    queryClient.setQueriesData({ queryKey: sippReportsKeys.annexCAll(userId) }, (old) => {
      if (!old?.pages?.length) return old;
      const firstPage = old.pages[0];
      return {
        pages: [{
          ...firstPage,
          reports: deletedId
            ? firstPage.reports.filter((report) => report.id !== deletedId)
            : firstPage.reports,
        }],
        pageParams: [1],
      };
    });
    void queryClient.invalidateQueries({ queryKey: sippReportsKeys.annexCAll(userId) });
  }

  function handleSeeMore() {
    if (!isPending && !reportsQuery.isFetching && reportsQuery.hasNextPage) {
      void reportsQuery.fetchNextPage();
    }
  }

  function updateRow(index, field, value) {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(index) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  // Clearing the editor also clears its saved-report identity, preventing a new form
  // from accidentally updating the previously selected draft.
  function resetForm() {
    setAcademicYear("");
    setDegreeProgram("");
    setRows([emptyRow(), emptyRow(), emptyRow(), emptyRow()]);
    setPreparedBy("");
    setCertifiedBy("");
    setFormError("");
    setEditingReportId(null);
  }

  // Copy saved entries so local edits do not mutate cached report objects.
  // The backend verifies that the requested report is still a draft at save time.
  function editDraft(report) {
    setAcademicYear(report.academic_year);
    setDegreeProgram(report.degree_program);
    setRows(report.entries?.length ? report.entries.map((entry) => ({ ...entry })) : [emptyRow()]);
    setPreparedBy(report.prepared_by || "");
    setCertifiedBy(report.certified_by || "");
    setFormError("");
    setEditingReportId(report.id);
  }

  async function handleSubmit(status, confirmed = false) {
    setFormError("");

    if (!academicYear || !/^\d{4}-\d{4}$/.test(academicYear)) {
      setFormError("Academic year must be formatted like 2026-2027.");
      return;
    }
    if (!degreeProgram.trim()) {
      setFormError("Degree program is required.");
      return;
    }
    if (status === "submitted" && !preparedBy.trim()) {
      setFormError("Prepared By is required to submit.");
      return;
    }
    // Draft saves skip confirmation. Submission requires Prepared By and an explicit
    // confirmation before sending the final status.
    if (status === "submitted" && !confirmed) {
      setConfirmation({ kind: "submit" });
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveAnnexCReport({
        ...(editingReportId ? { reportId: editingReportId } : {}),
        academicYear,
        degreeProgram,
        entries: rows,
        preparedBy,
        certifiedBy,
        status,
      });

      if (result?.error || !result?.report) {
        setFormError(result?.error || "The report could not be saved. Please try again.");
        return;
      }

      // Only a returned saved report resets the draft and switches tabs. Refresh all
      // report variants because a save can change year/status membership and offsets.
      refreshReportsCache();
      setTab("reports");
      resetForm();
      setQuery("");
      setReportsYear(academicYear);
      setReportsStatus(status);
      setFilters({ academicYear, status, search: "" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(reportId) {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const result = await toastAndAction({
        loadingLabel: "Deleting annual report...",
        successLabel: "Annual report deleted.",
        errorLabel: "Failed to delete annual report.",
        action: async () => {
          try {
            return await deleteAnnexCReport(reportId);
          } catch {
            return { success: false, error: "Could not delete the report. Please try again." };
          }
        },
      });
      if (!result?.success) return;
      if (editingReportId === reportId) resetForm();
      refreshReportsCache(reportId);
    } finally {
      setIsDeleting(false);
    }
  }

  return {
    tab,
    onTabSelect: (nextTab) => {
      if (nextTab !== tab) resetForm();
      setTab(nextTab);
    },
    reports,
    reportsQuery,
    isPending,
    isChangingFilters,
    handleSeeMore,
    formProps: {
      academicYear, setAcademicYear, degreeProgram, setDegreeProgram,
      rows, addRow, updateRow, removeRow, preparedBy, setPreparedBy,
      certifiedBy, setCertifiedBy, formError, editingReportId, isSaving,
      resetForm, handleSubmit,
    },
    filterProps: {
      query, setQuery, editingReportId, resetForm, showCachedFilters,
      reportsYear, setReportsYear, reportsStatus, setReportsStatus, availableYears,
    },
    cardProps: { editingReportId, resetForm, editDraft, setConfirmation },
    confirmationProps: {
      open: Boolean(confirmation),
      onOpenChange: (open) => {
        if (!open) setConfirmation(null);
      },
      title: confirmation?.kind === "delete" ? "Delete annual report?" : "Submit annual report?",
      description: confirmation?.kind === "delete" ? "This report will be permanently deleted." : "Submitting Annex C will finalize this report.",
      confirmLabel: confirmation?.kind === "delete" ? "Delete report" : "Submit report",
      destructive: confirmation?.kind === "delete",
      pending: isSaving || isDeleting,
      onConfirm: () => {
        const choice = confirmation;
        setConfirmation(null);
        if (choice?.kind === "delete") void handleDelete(choice.id);
        else if (choice?.kind === "submit") void handleSubmit("submitted", true);
      },
    },
  };
}
