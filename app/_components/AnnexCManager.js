"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, FileText, ClipboardList, Loader2 } from "lucide-react";
import {
  saveAnnexCReport,
  getAnnexCReports,
  deleteAnnexCReport,
} from "../_services/dept-head-actions";
import ExportPdfButton from "./ExportPdfButton";
import SearchBar from "./SearchBar";
import TabBar from "./TabBar";
import AnnualReportSkeleton from "./AnnualReportSkeleton";

const emptyRow = () => ({ issue: "", solution: "", recommendation: "" });

const innerTabs = [
  { value: "form", text: "Form" },
  { value: "reports", text: "Reports" },
];

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

        if (thisRequestId !== requestIdRef.current) return;

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
      <div className="mb-6 rounded-xl bg-stone-200 p-1.5 sm:w-fit">
        <TabBar tabs={innerTabs} selectedTab={tab} onSelect={setTab} />
      </div>

      {tab === "form" ? (
        <div className="space-y-5">
          <section className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-800">
              <FileText className="size-4 text-primary-500" /> Annex
              &quot;C&quot; — Header Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                  Academic Year (AY) <span className="text-red-600">*</span>
                </label>
                <input
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2026-2027"
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                  Degree Program <span className="text-red-600">*</span>
                </label>
                <input
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 rounded-lg bg-stone-50 px-4 py-3 md:grid-cols-2">
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-wide text-stone-500">
                  HEI
                </p>
                <p className="text-sm text-stone-800">{hei}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-medium uppercase tracking-wide text-stone-500">
                  Address
                </p>
                <p className="text-sm text-stone-800">{address}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800">
                <FileText className="size-4 text-primary-500" /> Issues,
                Solutions &amp; Recommendations
              </h3>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <Plus className="size-3.5" /> Add Row
              </button>
            </div>

            {/* Column headers — only shown at sm+, where the 3-column layout applies */}
            <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_auto] gap-3 border-b border-stone-200 pb-2 text-[0.65rem] font-medium uppercase tracking-wide text-stone-500">
              <span>Issues and Concerns Encountered</span>
              <span>Solutions</span>
              <span>Recommendations</span>
              <span />
            </div>

            <div className="space-y-4 sm:space-y-3 pt-3">
              {rows.map((row, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-stone-200 p-3 sm:border-0 sm:p-0 sm:rounded-none grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-3"
                >
                  <div className="flex flex-col gap-1 sm:contents">
                    <span className="text-[0.65rem] font-medium uppercase tracking-wide text-stone-500 sm:hidden">
                      Issues and Concerns Encountered
                    </span>
                    <textarea
                      value={row.issue}
                      onChange={(e) => updateRow(i, "issue", e.target.value)}
                      placeholder="Describe the issue or concern..."
                      rows={2}
                      className="rounded-md border border-stone-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col gap-1 sm:contents">
                    <span className="text-[0.65rem] font-medium uppercase tracking-wide text-stone-500 sm:hidden">
                      Solutions
                    </span>
                    <textarea
                      value={row.solution}
                      onChange={(e) => updateRow(i, "solution", e.target.value)}
                      placeholder="Describe the solution applied..."
                      rows={2}
                      className="rounded-md border border-stone-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col gap-1 sm:contents">
                    <span className="text-[0.65rem] font-medium uppercase tracking-wide text-stone-500 sm:hidden">
                      Recommendations
                    </span>
                    <textarea
                      value={row.recommendation}
                      onChange={(e) =>
                        updateRow(i, "recommendation", e.target.value)
                      }
                      placeholder="Recommendations for improvement..."
                      rows={2}
                      className="rounded-md border border-stone-300 bg-white p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="self-start sm:self-start text-stone-400 hover:text-red-600 transition-colors justify-self-end sm:justify-self-auto"
                    title="Remove row"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-stone-300 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-stone-800">
              Signatories
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                  Prepared By (Name &amp; Position){" "}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  placeholder="Full name of the preparer"
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">
                  Certified Correct (Name &amp; Position)
                </label>
                <input
                  value={certifiedBy}
                  onChange={(e) => setCertifiedBy(e.target.value)}
                  placeholder="Full name of the certifier"
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
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
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit("submitted")}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Submit Annex C"}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="items-start">
              <SearchBar
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search degree or program..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {["All", ...availableAcadYear].map((ay) => (
                <button
                  key={ay}
                  onClick={() => setReportsYear(ay === "All" ? "" : ay)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    (ay === "All" && !reportsYear) || reportsYear === ay
                      ? "bg-primary-500 text-primary-foreground"
                      : "bg-stone-200 text-muted-foreground hover:text-primary-500"
                  }`}
                >
                  {ay}
                </button>
              ))}
            </div>
          </div>

          {isPending ? (
            <AnnualReportSkeleton />
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 sm:py-20 text-center">
              <ClipboardList className="size-8 text-stone-300" />
              <p className="text-sm text-stone-500">No reports found</p>
            </div>
          ) : (
            reports.map((r) => (
              <section
                key={r.id}
                className="overflow-hidden rounded-xl border border-stone-300 bg-white shadow-sm"
              >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-4 sm:px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="grid size-9 flex-shrink-0 place-items-center rounded-lg bg-primary-50 text-primary-500">
                      <FileText className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-stone-800">
                        Annex &quot;C&quot; — SIPP Annual Report
                      </p>
                      <p className="text-xs text-stone-500 truncate">
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
                  <div className="flex items-center gap-2 flex-shrink-0 ">
                    <ExportPdfButton
                      endpoint="/api/reports/annex-c"
                      params={{ reportId: r.id }}
                    />
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="rounded-md p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete report"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </header>

                <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 text-sm">
                  <p>
                    <span className="text-stone-500">Degree Program: </span>
                    <span className="font-semibold text-stone-800">
                      {r.degree_program}
                    </span>
                  </p>
                  {r.prepared_by && (
                    <p className="text-stone-500">
                      Prepared By:{" "}
                      <span className="text-stone-800">{r.prepared_by}</span>
                    </p>
                  )}
                </div>

                {r.entries?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-sm">
                      <thead>
                        <tr className="border-t border-b border-stone-200 text-left text-[0.65rem] uppercase tracking-wider text-stone-500">
                          <th className="px-4 sm:px-5 py-3 font-medium">
                            Issues &amp; Concerns
                          </th>
                          <th className="px-4 sm:px-5 py-3 font-medium">
                            Solutions
                          </th>
                          <th className="px-4 sm:px-5 py-3 font-medium">
                            Recommendations
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.entries.map((e, i) => (
                          <tr
                            key={i}
                            className="border-b border-stone-200 last:border-0"
                          >
                            <td className="px-4 sm:px-5 py-3 text-stone-700">
                              {e.issue}
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-stone-700">
                              {e.solution}
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-stone-700">
                              {e.recommendation}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))
          )}

          {!isPending && currentPage < totalPages && (
            <div className="text-center">
              <button
                onClick={handleSeeMore}
                className="text-sm font-semibold text-stone-600 hover:text-primary-500 transition-colors"
              >
                See more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
