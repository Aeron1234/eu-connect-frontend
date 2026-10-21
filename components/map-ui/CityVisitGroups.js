"use client";

import { useId, useMemo, useState } from "react";
import { ChevronDown, ExternalLink, MapPin, Route } from "lucide-react";
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
  return <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:h-[600px]" aria-label="Students grouped by city">
    <div className="space-y-3 border-b border-border p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground"><MapPin className="size-4 text-primary-emphasis" />Visit by city</h2>
        <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{groups.length} groups</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">Unique students across all departments in your current filters. Expand a city to see companies and names.</p>
      <div className="flex min-w-0 items-center gap-2 text-xs text-foreground">
        <label htmlFor={sortId} className="shrink-0">Sort by</label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger id={sortId} className="min-h-10 min-w-0 flex-1 rounded-lg bg-card px-3 py-2 text-xs">
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
    <div className="max-h-[440px] min-h-0 overflow-y-auto overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:max-h-none lg:flex-1" tabIndex={0} aria-label="City groups">
    {groups.length === 0 && <p className="p-4 text-sm text-muted-foreground">No cities match your filters.</p>}
    {groups.map((group) => <details key={group.id} className="group/city border-b border-border last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 text-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block break-words text-sm font-semibold">{group.name}</span>
          {group.province && <span className="mt-0.5 block text-xs text-muted-foreground">{group.province}</span>}
          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-semibold text-primary-emphasis">{`${group.studentCount} ${group.studentCount === 1 ? "student" : "students"}`}</span>
            <span className="text-muted-foreground">{`${group.companyCount} ${group.companyCount === 1 ? "company" : "companies"}`}</span>
          </span>
        </span>
        <ChevronDown className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-open/city:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="space-y-5 border-t border-border bg-muted/20 p-4">
        {group.id === "unclassified" && <p className="text-sm text-muted-foreground">These records need a city and province before they can be assigned to a visit group. Their company pins and routes are still available.</p>}
        {group.sites.map((site) => <article key={site.id} className="min-w-0 border-l-2 border-primary/20 pl-3">
          <h3 className="break-words text-sm font-semibold text-foreground">{site.company}</h3>
          <p className="mt-1 break-words text-xs text-muted-foreground">{site.address}</p>
          <ul className="my-3 space-y-2">
            {Array.from(new Map(site.interns.map((intern) => [intern.studentId || intern.id, intern])).values()).map((intern) => <li key={intern.studentId || intern.id} className="min-w-0 text-xs text-foreground">
              <span className="break-words font-medium">{intern.name}</span><span className="block text-xs text-muted-foreground">{intern.courseShortName || intern.course}</span>
            </li>)}
          </ul>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button type="button" onClick={() => onShowRoute(site)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"><Route className="size-4" />Show road route</button>
            {directionsUrl(site, origin) && <a href={directionsUrl(site, origin)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 text-xs font-semibold text-primary-emphasis hover:underline">Google Maps <ExternalLink className="size-3.5" /></a>}
          </div>
        </article>)}
      </div>
    </details>)}
    </div>
  </section>;
}
