"use client";

import { Building2, MapPin, Users } from "lucide-react";
import ProgressBar from "../ui/ProgressBar";

export default function CompanySiteCard({ site }) {
  return (
    <article
      key={site.id}
      className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
          >
            {site.initials}
          </span>
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0 text-primary-emphasis" />
              <span className="truncate">{site.company}</span>
            </h2>
            <p className="mt-0.5 flex items-start gap-1.5 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">
                {site.address}
                {site.region_name ? `, ${site.region_name}` : ""}
              </span>
            </p>
          </div>
        </div>
        <span
          className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground"
        >
          <Users className="h-3.5 w-3.5" /> {site.interns.length} ongoing
        </span>
      </div>

      <div className="mt-4 sm:mt-5 grid gap-3 sm:grid-cols-2">
        {site.interns.map((i) => (
          <div
            key={i.id}
            className="rounded-lg border border-border p-3 sm:p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-foreground">
                {i.name}
              </p>
              <span className="shrink-0 text-xs font-semibold text-primary-emphasis">
                {i.progress}%
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
              {i.role} · {i.course}
            </p>
            <ProgressBar
              value={i.progress}
              label={`${i.name} internship progress`}
              size="sm"
              className="mt-2"
            />
            <p className="mt-1 text-[11px] text-muted-foreground truncate">
              {i.period}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
