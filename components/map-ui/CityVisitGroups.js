"use client";

import { useId, useMemo, useState } from "react";
import { ExternalLink, Route } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { directionsUrl, groupSitesByCity } from "./mapVisitPlanning.mjs";

export default function CityVisitGroups({ sites, origin, onShowRoute }) {
  const [sort, setSort] = useState("students");
  const sortId = useId();
  const groups = useMemo(() => groupSitesByCity(sites).sort((a, b) => {
    if (a.id === "unclassified") return 1;
    if (b.id === "unclassified") return -1;
    const difference = sort === "students" ? b.studentCount - a.studentCount : sort === "companies" ? b.companyCount - a.companyCount : 0;
    return difference || a.name.localeCompare(b.name) || a.province.localeCompare(b.province);
  }), [sites, sort]);
  return <section className="space-y-4" aria-label="Students grouped by city">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="max-w-2xl text-sm text-muted-foreground">Unique student counts by city/municipality, across all departments and current filters. Routes start from {origin.label}.</p>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <label htmlFor={sortId} className="shrink-0">Sort by</label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger id={sortId} className="min-h-10 min-w-40 rounded-lg bg-card px-3 py-2 text-sm">
            <SelectValue placeholder="Sort cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="students">Most students</SelectItem>
            <SelectItem value="companies">Most companies</SelectItem>
            <SelectItem value="name">City name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    {groups.map((group) => <details key={group.id} open className="rounded-xl border border-border bg-card">
      <summary className="cursor-pointer p-4 text-foreground sm:p-5">
        <span className="font-semibold">{group.name}</span>{group.province && <span className="ml-2 text-sm text-muted-foreground">{group.province}</span>}
        <span className="mt-1 block text-xs text-muted-foreground">{group.studentCount} {group.studentCount === 1 ? "student" : "students"} · {group.companyCount} {group.companyCount === 1 ? "company" : "companies"}</span>
      </summary>
      <div className="space-y-4 border-t border-border p-4 sm:p-5">
        {group.id === "unclassified" && <p className="text-sm text-muted-foreground">These records need a city and province before they can be assigned to a visit group. Their company pins and routes are still available.</p>}
        {group.sites.map((site) => <article key={site.id} className="min-w-0 rounded-lg border border-border p-3 sm:p-4">
          <h3 className="break-words text-sm font-semibold text-foreground">{site.company}</h3>
          <p className="mt-1 break-words text-xs text-muted-foreground">{site.address}</p>
          <ul className="my-3 grid gap-2 sm:grid-cols-2">
            {Array.from(new Map(site.interns.map((intern) => [intern.studentId || intern.id, intern])).values()).map((intern) => <li key={intern.studentId || intern.id} className="min-w-0 text-sm text-foreground">
              <span className="break-words font-medium">{intern.name}</span><span className="block text-xs text-muted-foreground">{intern.courseShortName || intern.course}</span>
            </li>)}
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => onShowRoute(site)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"><Route className="size-4" />Show road route</button>
            {directionsUrl(site, origin) && <a href={directionsUrl(site, origin)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-primary-emphasis hover:underline">Google Maps <ExternalLink className="size-3.5" /></a>}
          </div>
        </article>)}
      </div>
    </details>)}
  </section>;
}
