"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, FileText, Loader2, Users } from "lucide-react";

import ExportPdfButton from "../ui/ExportPdfButton";
import { getHteCompanyList } from "@/lib/server-actions/sipp-hte-actions";
import SearchBar from "../ui/SearchBar";
import HTEListSkeleton from "../skeletons/HTEListSkeleton";
import { hasValidPage } from "@/lib/see-more-pagination.mjs";

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
    setIsPending(true);

    const timeout = setTimeout(async () => {
      try {
        const newData = await getHteCompanyList({
          academicYear: year,
          search: query,
          page: 1,
        });

        if (thisRequestId !== requestIdRef.current) return;

        if (!hasValidPage(newData, "companies")) {
          console.error(
            "Error loading HTE companies:",
            newData?.error || "Invalid response from the server",
          );
          return;
        }

        setCompanies(newData.companies);
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

      if (!hasValidPage(newData, "companies", "pagination", nextPage)) {
        console.error(
          "Error loading more HTE companies:",
          newData?.error || "Invalid response from the server",
        );
        return;
      }

      const incoming = newData.companies;

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
      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="items-start">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or student name..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["All", ...availableAcadYear].map((ay) => (
            <button
              key={ay}
              type="button"
              onClick={() => setYear(ay === "All" ? "" : ay)}
              className={cx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                (ay === "All" && !year) || year === ay
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-primary-emphasis",
              )}
            >
              {ay}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-3">
        <StatCard
          icon={<Building2 className="size-5 opacity-80" />}
          value={String(total)}
          label="Partner HTEs"
          highlight
        />
        <StatCard
          icon={<Users className="size-5 text-foreground-subtle" />}
          value={String(totalInterns)}
          label="Total Interns (loaded)"
        />
        <StatCard
          icon={<FileText className="size-5 text-foreground-subtle" />}
          value={year || "All"}
          label="Academic Year"
        />
      </div>

      {isPending ? (
        <HTEListSkeleton />
      ) : companies.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
          <FileText className="size-8 text-foreground-faint" />
          <p className="text-sm text-muted-foreground">No placements found</p>
          <p className="max-w-sm text-xs text-foreground-subtle">
            Try a different academic year or clear the search filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4 sm:space-y-5">
          {companies.map((c) => (
            <section
              key={c.company_key}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 sm:px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="grid size-9 flex-shrink-0 place-items-center rounded-lg bg-primary-50 text-xs font-semibold text-primary-emphasis">
                    {c.company_name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {c.company_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {c.company_address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-emphasis">
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
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground">
                      <th className="w-12 px-4 sm:px-5 py-3 font-medium">#</th>
                      <th className="px-4 sm:px-5 py-3 font-medium">
                        Name of Student Intern
                      </th>
                      <th className="px-4 sm:px-5 py-3 font-medium">Program</th>
                      <th className="px-4 sm:px-5 py-3 font-medium">Gender</th>
                      <th className="px-4 sm:px-5 py-3 font-medium">
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
                        <td className="px-4 sm:px-5 py-3 text-muted-foreground">
                          {i + 1}
                        </td>
                        <td className="px-4 sm:px-5 py-3 font-medium text-foreground">
                          {intern.name}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                          {intern.course}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                          {intern.gender || "—"}
                        </td>
                        <td className="px-4 sm:px-5 py-3 text-foreground-soft">
                          {intern.date_started?.slice(0, 10)} –{" "}
                          {intern.date_ended?.slice(0, 10) || "Present"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {!isPending && currentPage < totalPages && (
        <div className="mt-5 text-center">
          <button
            onClick={handleSeeMore}
            className="text-sm font-semibold text-foreground-soft hover:text-primary-emphasis transition-colors"
          >
            See more
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
        "flex items-center gap-3 sm:gap-4 rounded-xl border px-4 sm:px-5 py-4 sm:py-5 shadow-sm",
        highlight
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground",
      )}
    >
      {icon}
      <div>
        <p className="text-xl sm:text-2xl font-bold leading-none">{value}</p>
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
