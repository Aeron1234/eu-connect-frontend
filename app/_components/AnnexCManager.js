"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, FileText, ClipboardList } from "lucide-react";
import {
  saveAnnexCReport,
  getAnnexCReports,
  deleteAnnexCReport,
} from "../_services/dept-head-actions";
import ExportPdfButton from "./ExportPdfButton";
import SearchBar from "./SearchBar";

const emptyRow = () => ({ issue: "", solution: "", recommendation: "" });

export default function AnnexCManager({
  hei,
  address,
  availableAcadYear = [],
  initialReports = [],
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  } = {},
  academicYear: initialYear = "",
}) {
  const [tab, setTab] = useState("form");

  // --- Form tab state ---
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
  const [formError, setFormError] = useState("");

  // --- Reports tab state, seeded from server-fetched props ---
  const [reports, setReports] = useState(initialReports);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [reportsYear, setReportsYear] = useState(initialYear);
  const [query, setQuery] = useState("");
  const [isPending, setIsPending] = useState(false);

  const requestIdRef = useRef(0);
  const isFirstRun = useRef(true);

  // Debounce year/search changes behind one timer — same pattern as InternshipPosts
  // and AnnexDHteList. Skips the very first run so we don't immediately refetch
  // what initialReports already gave us from the server.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const thisRequestId = ++requestIdRef.current;

    const timeout = setTimeout(async () => {
      setIsPending(true);
      try {
        const newData = await getAnnexCReports({
          academicYear: reportsYear,
          search: query,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return; // stale, ignore

        if (newData?.error) {
          console.error("Error loading Annex C reports:", newData.error);
          setReports([]);
          setTotalPages(1);
          setTotal(0);
          setCurrentPage(1);
          return;
        }

        setReports(newData?.reports || []);
        setCurrentPage(1);
        setTotalPages(newData?.pagination?.totalPages || 1);
        setTotal(newData?.pagination?.total || 0);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading Annex C reports:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [reportsYear, query]);

  async function handleSeeMore() {
    if (isPending || currentPage >= totalPages) return;
    setIsPending(true);
    const nextPage = currentPage + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getAnnexCReports({
        academicYear: reportsYear,
        search: query,
        page: nextPage,
      });

      if (thisRequestId !== requestIdRef.current) return;

      if (newData?.error) {
        console.error("Error loading more Annex C reports:", newData.error);
        return;
      }

      const incoming = newData?.reports || [];

      setReports((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const filteredNew = incoming.filter((r) => !existingIds.has(r.id));
        return [...prev, ...filteredNew];
      });

      setCurrentPage(nextPage);
      if (newData?.pagination?.totalPages) {
        setTotalPages(newData.pagination.totalPages);
      }
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more Annex C reports:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
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

  async function handleSubmit(status) {
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

    setIsSaving(true);
    try {
      const result = await saveAnnexCReport({
        academicYear,
        degreeProgram,
        entries: rows,
        preparedBy,
        certifiedBy,
        status,
      });

      if (result?.error) {
        setFormError(result.error);
        return;
      }

      if (status === "submitted") {
        setAcademicYear("");
        setDegreeProgram("");
        setRows([emptyRow(), emptyRow(), emptyRow(), emptyRow()]);
        setPreparedBy("");
        setCertifiedBy("");

        // New submission won't be in `reports` yet since that state was seeded
        // from a prior fetch — prepend it directly instead of refetching.
        if (result.report) {
          setReports((prev) => [result.report, ...prev]);
          setTotal((prev) => prev + 1);
        }
        setTab("reports");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(reportId) {
    if (!confirm("Delete this report? This cannot be undone.")) return;
    const result = await deleteAnnexCReport(reportId);
    if (result?.error) {
      console.error(result.error);
      return;
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId));
    setTotal((prev) => Math.max(0, prev - 1));
  }

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("form")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "form"
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="size-4" /> Form
        </button>
        <button
          onClick={() => setTab("reports")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === "reports"
              ? "border-primary-500 text-primary-500"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList className="size-4" /> Reports
        </button>
      </div>

      {tab === "form" ? (
        <div className="space-y-5">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <FileText className="size-4 text-primary-500" /> Annex
              &quot;C&quot; — Header Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Academic Year (AY) <span className="text-red-600">*</span>
                </label>
                <input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Degree Program <span className="text-red-600">*</span>
                </label>
                <input
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 rounded-lg bg-muted px-4 py-3 md:grid-cols-2">
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                  HEI
                </p>
                <p className="text-sm text-foreground">{hei}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                  Address
                </p>
                <p className="text-sm text-foreground">{address}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="size-4 text-primary-500" /> Issues,
                Solutions &amp; Recommendations
              </h3>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                <Plus className="size-3.5" /> Add Row
              </button>
            </div>

            <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-border pb-2 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
              <span>Issues and Concerns Encountered</span>
              <span>Solutions</span>
              <span>Recommendations</span>
              <span />
            </div>

            <div className="space-y-3 pt-3">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3"
                >
                  <textarea
                    value={row.issue}
                    onChange={(e) => updateRow(i, "issue", e.target.value)}
                    placeholder="Describe the issue or concern..."
                    rows={2}
                    className="rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:ring focus:ring-primary-300"
                  />
                  <textarea
                    value={row.solution}
                    onChange={(e) => updateRow(i, "solution", e.target.value)}
                    placeholder="Describe the solution applied..."
                    rows={2}
                    className="rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:ring focus:ring-primary-300"
                  />
                  <textarea
                    value={row.recommendation}
                    onChange={(e) =>
                      updateRow(i, "recommendation", e.target.value)
                    }
                    placeholder="Recommendations for improvement..."
                    rows={2}
                    className="rounded-md border border-input bg-background p-2.5 text-sm outline-none focus:ring focus:ring-primary-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="self-start text-muted-foreground hover:text-red-600"
                    title="Remove row"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Signatories
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Prepared By (Name &amp; Position){" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  placeholder="Full name of the preparer"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Certified Correct (Name &amp; Position)
                </label>
                <input
                  value={certifiedBy}
                  onChange={(e) => setCertifiedBy(e.target.value)}
                  placeholder="Full name of the certifier"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring focus:ring-primary-300"
                />
              </div>
            </div>
          </section>

          {formError && (
            <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => handleSubmit("draft")}
              disabled={isSaving}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("submitted")}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-500/90 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Submit Annex C"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {["All", ...availableAcadYear].map((ay) => (
                <button
                  key={ay}
                  onClick={() => setReportsYear(ay === "All" ? "" : ay)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    (ay === "All" && !reportsYear) || reportsYear === ay
                      ? "bg-primary-500 text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {ay}
                </button>
              ))}
            </div>

            <SearchBar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search degree program..."
            />
          </div>

          {reports.length === 0 && !isPending ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-24 text-center shadow-sm">
              <ClipboardList className="size-8 text-muted-foreground" />
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No reports found
              </p>
            </div>
          ) : (
            reports.map((r) => (
              <section
                key={r.id}
                className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-primary-500/10 text-primary-500">
                      <FileText className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Annex &quot;C&quot; — SIPP Annual Report
                      </p>
                      <p className="text-xs text-muted-foreground">
                        AY {r.academic_year} · {r.degree_program} ·{" "}
                        {r.submitted_at
                          ? `Submitted ${new Date(r.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                          : "Draft"}
                        {r.prepared_by
                          ? ` · By ${r.prepared_by.split(",")[0]}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExportPdfButton
                      endpoint="/api/reports/annex-c"
                      params={{ reportId: r.id }}
                    />
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      title="Delete report"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <p>
                    <span className="text-muted-foreground">
                      Degree Program:{" "}
                    </span>
                    <span className="font-semibold text-foreground">
                      {r.degree_program}
                    </span>
                  </p>
                  {r.prepared_by && (
                    <p className="text-muted-foreground">
                      Prepared By:{" "}
                      <span className="text-foreground">{r.prepared_by}</span>
                    </p>
                  )}
                </div>

                {r.entries?.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-t border-b border-border text-left text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        <th className="px-5 py-3 font-medium">
                          Issues &amp; Concerns
                        </th>
                        <th className="px-5 py-3 font-medium">Solutions</th>
                        <th className="px-5 py-3 font-medium">
                          Recommendations
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.entries.map((e, i) => (
                        <tr
                          key={i}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-5 py-3 text-foreground">
                            {e.issue}
                          </td>
                          <td className="px-5 py-3 text-foreground">
                            {e.solution}
                          </td>
                          <td className="px-5 py-3 text-foreground">
                            {e.recommendation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            ))
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
        </div>
      )}
    </div>
  );
}
