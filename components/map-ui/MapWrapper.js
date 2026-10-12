"use client";

import { Building2, MapPin, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { mapLocationsOptions } from "@/lib/cache/map-locations-queries";
import dynamic from "next/dynamic";
import PageTitle from "../ui/PageTitle";
import SearchBar from "../ui/SearchBar";
import MapDropdownFilter from "./MapDropdownFilter";
import ProgressBar from "../ui/ProgressBar";
import { Skeleton } from "@/components/ui/skeleton";
import ManualDialog from "@/components/ui/ManualDialog";
import ErrorUI from "@/components/ui/ErrorUI";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[540px] w-full rounded-xl" role="status" aria-label="Loading map" />
  ),
});

const tabs = ["Map View", "Companies"];
const emptyCompanies = [];

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatPeriod(dateStarted, dateEnded) {
  const start = dateStarted
    ? new Date(dateStarted).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";
  const end = dateEnded
    ? new Date(dateEnded).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Present";
  return `${start} – ${end}`;
}

export default function MapWrapper() {
  const { user } = useUser();
  const locationsQuery = useQuery({
    ...mapLocationsOptions(user?.id),
    enabled: Boolean(user?.id),
  });
  const initialData = locationsQuery.data?.companies || emptyCompanies;
  const regions = locationsQuery.data?.availableRegions || [];
  const [tab, setTab] = useState(tabs[0]);
  const [regionId, setRegionId] = useState(null); // null = "All Locations"
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // Normalize the API's company shape into what the map/list UI expects,
  // once — stable composite id since the API doesn't provide one
  const companySites = useMemo(
    () =>
      initialData.map((c) => ({
        id: `${c.company_name}_${c.lat}_${c.lon}`,
        company: c.company_name,
        initials: getInitials(c.company_name),
        address: c.company_address,
        region_id: c.region_id,
        region_name: c.region_name,
        lat: Number(c.lat),
        lng: Number(c.lon),
        interns: c.interns.map((i) => ({
          id: i.internship_id,
          name: i.name,
          course: i.course,
          courseShortName: i.course_short_name,
          role: i.position,
          progress: i.percent_complete,
          period: formatPeriod(i.date_started, i.date_ended),
        })),
      })),
    [initialData],
  );

  const sites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companySites
      .filter((s) => !regionId || s.region_id === regionId)
      .map((s) => ({
        ...s,
        interns: q
          ? s.interns.filter(
              (i) =>
                i.name.toLowerCase().includes(q) ||
                i.course.toLowerCase().includes(q) ||
                i.courseShortName?.toLowerCase().includes(q) ||
                s.company.toLowerCase().includes(q),
            )
          : s.interns,
      }))
      .filter((s) => s.interns.length > 0);
  }, [companySites, regionId, query]);

  const selected = sites.find((s) => s.id === selectedId) ?? null;
  const blockingError = locationsQuery.isError && !locationsQuery.data;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          Icon={MapPin}
          title={"Student Map"}
          description={
            "Showing all the interns and their company across the map."
          }
          titleAction={
            <ManualDialog title="How to use the student map">
              <div className="space-y-4 text-sm leading-relaxed text-foreground">
                <p>Explore the current internship locations and students assigned to each company.</p>
                <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
                  <li>Use the <strong>search box</strong> to find a student, company, or course. Choose a <strong>region</strong> to narrow the locations shown.</li>
                  <li>In <strong>Map View</strong>, pan or zoom the map, then select a pin. The number on the pin shows how many interns are at that company.</li>
                  <li>Read the selected company&apos;s details and each intern&apos;s progress in the panel beside or below the map. Select another pin to switch companies.</li>
                  <li>Switch to <strong>Companies</strong> to browse the same results as cards, with each company&apos;s interns and progress listed together.</li>
                </ol>
              </div>
            </ManualDialog>
          }
        />

        <div className="flex rounded-lg bg-secondary p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                tab === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary-emphasis"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {locationsQuery.isError && locationsQuery.data && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-4 text-sm">
          The latest map update could not be loaded. Showing the last available data.
          <button type="button" onClick={() => void locationsQuery.refetch()} className="ml-3 font-semibold text-primary-emphasis">Try again</button>
        </div>
      )}
      {locationsQuery.isPending ? (
        <div className="space-y-6" role="status" aria-label="Loading locations">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-11 w-full rounded-lg sm:max-w-md" />
            <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
          </div>
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-xl border border-border bg-card p-2"><Skeleton className="h-[540px] w-full rounded-xl" /></div>
            <Skeleton className="h-[540px] w-full rounded-xl" />
          </div>
        </div>
      ) : blockingError ? (
        <ErrorUI error={locationsQuery.error} reset={() => void locationsQuery.refetch()} logError={false} />
      ) : <div className="space-y-6">
        {/* Search + location filter */}

        <div className="flex gap-2 flex-col sm:flex-row">
          <div className="relative">
            {/* <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /> */}
            <SearchBar
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, company, course..."
              aria-label="Search student, company, course"
              className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent sm:max-w-md"
            />
          </div>

          <MapDropdownFilter
            regions={regions}
            regionId={regionId}
            onChange={setRegionId}
          />
        </div>

        {tab === "Map View" ? (
          <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
              <Map
                sites={sites}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <p className="px-2 py-2 text-xs text-muted-foreground">
                Each pin shows the number of interns at that company — click a
                pin to see their names.
              </p>
            </div>

            <aside className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm">
              {selected ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
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
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {sites.map((s) => (
              <article
                key={s.id}
                className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                      {s.initials}
                    </span>
                    <div className="min-w-0">
                      <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-foreground">
                        <Building2 className="h-4 w-4 flex-shrink-0 text-primary-emphasis" />
                        <span className="truncate">{s.company}</span>
                      </h2>
                      <p className="mt-0.5 flex items-start gap-1.5 text-xs sm:text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {s.address}
                          {s.region_name ? `, ${s.region_name}` : ""}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                    <Users className="h-3.5 w-3.5" /> {s.interns.length} ongoing
                  </span>
                </div>

                <div className="mt-4 sm:mt-5 grid gap-3 sm:grid-cols-2">
                  {s.interns.map((i) => (
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
            ))}
          </div>
        )}

        {sites.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
            <MapPin className="size-8 text-foreground-faint" />
            <p className="text-sm text-muted-foreground">
              No interns match your filters.
            </p>
          </div>
        )}
      </div>}
    </main>
  );
}
