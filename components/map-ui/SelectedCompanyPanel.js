"use client";

import { MapPin } from "lucide-react";
import ProgressBar from "../ui/ProgressBar";

export default function SelectedCompanyPanel({ selected, routeControls = null, embedded = false }) {
  return (
    <aside className={embedded ? "bg-card p-3 sm:p-4 lg:p-5" : "rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm"}>
      {selected ? (
        <>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground"
            >
              {selected.initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm sm:text-base font-bold text-foreground">
                {selected.company}
              </p>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {selected.address}
                {selected.region_name
                  ? `, ${selected.region_name}`
                  : ""}
              </p>
            </div>
          </div>
          {routeControls}
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {selected.interns.length} interns on-site
          </p>
          <ul className="mt-2 space-y-3">
            {selected.interns.map((i) => (
              <li
                key={i.id}
                className="rounded-lg bg-muted p-2.5 sm:p-3"
              >
                <p className="text-sm font-semibold text-foreground truncate">
                  {i.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {i.role} · {i.course}
                </p>
                <ProgressBar
                  value={i.progress}
                  label={`${i.name} internship progress`}
                  size="sm"
                  className="mt-2"
                />
                <p className="mt-1 text-[11px] text-muted-foreground truncate">
                  {i.progress}% complete · {i.period}
                </p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
          <MapPin className="h-8 w-8 text-foreground-faint" />
          <p className="text-sm font-semibold text-foreground">
            No company selected
          </p>
          <p className="text-xs text-muted-foreground">
            Click a pin on the map to see the students deployed there.
          </p>
        </div>
      )}
    </aside>
  );
}
