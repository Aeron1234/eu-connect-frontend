"use client";

import { format, isValid } from "date-fns";
import { ExternalLink } from "lucide-react";
import { companyWebsiteHref } from "@/lib/company-website.mjs";
import CompanyRotations from "./CompanyRotations";
import ProgressBar from "../ui/ProgressBar";
import RecordsCompanyMap from "./RecordsCompanyMap";

function formatOverviewDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return isValid(date) ? format(date, "MMMM d, yyyy") : null;
}

export default function RecordOverviewTab({ record, internshipId }) {
  const websiteHref = companyWebsiteHref(record.company_website);
  const startDate = formatOverviewDate(record.date_started);
  const endDate = record.status === "ongoing"
    ? "still ongoing"
    : formatOverviewDate(record.date_ended) || "End date unavailable";
  const duration = startDate ? `${startDate} – ${endDate}` : "–";
  const pct = Math.min(
    100,
    Math.round((record.accumulated_hours / record.total_hours) * 100),
  );
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border shadow-sm bg-card p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-primary-emphasis">
          Internship Details
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          {[
            ["Company", record.company_name],
            ["Company website", websiteHref ? (
              <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-start gap-1.5 text-primary-emphasis underline underline-offset-4 hover:opacity-80">
                <span className="min-w-0 break-all">{record.company_website.trim()}</span>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : record.company_website?.trim() || "-"],
            [
              "Supervisor",
              `${record.supervisor_name ? record.supervisor_name : "–"}`,
            ],
            ["Duration", duration],
            ["Submitted", formatOverviewDate(record.created_at) || "–"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted-foreground">{k}</dt>
              <dd className="min-w-0 break-words text-right font-medium text-foreground">
                {v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="rounded-xl border border-border shadow-sm bg-card p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-bold text-primary-emphasis">
          Hours Rendered
        </h3>
        <p className="mt-3 text-2xl sm:text-3xl font-bold text-primary-emphasis">
          {record.accumulated_hours.toFixed(1)}
          <span className="text-sm sm:text-base font-normal text-muted-foreground">
            /{record.total_hours} hrs
          </span>
        </p>
        <ProgressBar
          value={pct}
          label="Required internship hours completed"
          className="mt-3"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          {pct}% of required hours completed
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3 text-center text-xs">
          <Stat label="DTR entries" value={record.dtr_count} />
          <Stat label="Narratives" value={record.narrative_count} />
          <Stat label="Documents" value={record.document_count} />
        </div>
      </div>
      <CompanyRotations internshipId={internshipId} readOnly compact className="sm:col-span-2" />
      <RecordsCompanyMap record={record} internshipId={internshipId} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg bg-muted py-2">
      <p className="text-base sm:text-lg font-bold text-primary-emphasis">
        {value}
      </p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
