"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, FileText, Search, Users } from "lucide-react";

import ExportPdfButton from "./ExportPdfButton";
import { getHteCompanyList } from "../_services/dept-head-actions";
import SearchBar from "./SearchBar";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function AnnexDHteList({
  availableAcadYear = [],
  initialData = [],
  pagination: {
    page: initialPage = 1,
    total: initialTotal = 0,
    totalPages: initialTotalPages = 1,
  },
  academicYear: initialYear = "",
}) {
  const [companies, setCompanies] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [year, setYear] = useState(initialYear);
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
        const newData = await getHteCompanyList({
          academicYear: year,
          search: query,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (newData?.error) {
          console.error("Error loading HTE companies:", newData.error);
          setCompanies([]);
          setTotalPages(1);
          setTotal(0);
          setCurrentPage(1);
          return;
        }

        setCompanies(newData?.companies || []);
        setCurrentPage(1);
        setTotalPages(newData?.pagination?.totalPages || 1);
        setTotal(newData?.pagination?.total || 0);
      } catch (error) {
        if (thisRequestId === requestIdRef.current) {
          console.error("Error loading HTE companies:", error);
        }
      } finally {
        if (thisRequestId === requestIdRef.current) setIsPending(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [year, query]);

  async function handleSeeMore() {
    if (isPending || currentPage >= totalPages) return;
    setIsPending(true);
    const nextPage = currentPage + 1;
    const thisRequestId = ++requestIdRef.current;

    try {
      const newData = await getHteCompanyList({
        academicYear: year,
        search: query,
        page: nextPage,
      });

      if (thisRequestId !== requestIdRef.current) return;

      if (newData?.error) {
        console.error("Error loading more HTE companies:", newData.error);
        return;
      }

      const incoming = newData?.companies || [];

      setCompanies((prev) => {
        const existingKeys = new Set(prev.map((c) => c.company_key));
        const filteredNew = incoming.filter(
          (c) => !existingKeys.has(c.company_key),
        );
        return [...prev, ...filteredNew];
      });

      setCurrentPage(nextPage);
      if (newData?.pagination?.totalPages) {
        setTotalPages(newData.pagination.totalPages);
      }
    } catch (error) {
      if (thisRequestId === requestIdRef.current) {
        console.error("Error loading more HTE companies:", error);
      }
    } finally {
      if (thisRequestId === requestIdRef.current) setIsPending(false);
    }
  }

  const totalInterns = companies.reduce((n, c) => n + (c.intern_count || 0), 0);

  return (
    <div>
      {/* Filter bar — same pattern as AnnexCManager's Reports tab */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["All", ...availableAcadYear].map((ay) => (
            <button
              key={ay}
              type="button"
              onClick={() => setYear(ay === "All" ? "" : ay)}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                (ay === "All" && !year) || year === ay
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {ay}
            </button>
          ))}
        </div>

        <SearchBar
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company or student name..."
        />
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Building2 className="size-5 opacity-80" />}
          value={String(total)}
          label="Partner HTEs"
          highlight
        />
        <StatCard
          icon={<Users className="size-5 text-muted-foreground" />}
          value={String(totalInterns)}
          label="Total Interns (loaded)"
        />
        <StatCard
          icon={<FileText className="size-5 text-muted-foreground" />}
          value={year || "All"}
          label="Academic Year"
        />
      </div>

      {/* HTE sections */}
      {companies.length === 0 && !isPending ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-24 text-center shadow-sm">
          <FileText className="size-8 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">
            No placements found
          </p>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground/70">
            Try a different academic year or clear the search filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {companies.map((c) => (
            <section
              key={c.company_key}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary-500/10 text-xs font-semibold text-primary-500">
                    {c.company_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {c.company_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.company_address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-500">
                    {c.intern_count}{" "}
                    {c.intern_count === 1 ? "intern" : "interns"}
                  </span>
                  <ExportPdfButton
                    endpoint="/api/reports/annex-d"
                    params={{
                      companyKey: c.company_key,
                      academicYear: c.academic_year,
                    }}
                  />
                </div>
              </header>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                    <th className="w-12 px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">
                      Name of Student Intern
                    </th>
                    <th className="px-5 py-3 font-medium">Program</th>
                    <th className="px-5 py-3 font-medium">Gender</th>
                    <th className="px-5 py-3 font-medium">
                      Duration of Internship
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.interns.map((intern, i) => (
                    <tr
                      key={`${c.company_key}-${i}`}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-5 py-3 text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="px-5 py-3 font-medium text-foreground">
                        {intern.name}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {intern.course}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {intern.gender || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {intern.date_started?.slice(0, 10)} –{" "}
                        {intern.date_ended?.slice(0, 10) || "Present"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}

      {currentPage < totalPages && (
        <div className="mt-5 text-center">
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
  );
}

function StatCard({ icon, value, label, highlight }) {
  return (
    <div
      className={cx(
        "flex items-center gap-4 rounded-xl border px-5 py-5 shadow-sm",
        highlight
          ? "border-primary-500 bg-primary-500 text-primary-foreground"
          : "border-border bg-card text-foreground",
      )}
    >
      {icon}
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p
          className={cx(
            "mt-1.5 text-xs",
            highlight ? "opacity-80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
