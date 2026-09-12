"use client";

import { Building2, MapPin, Search, Users } from "lucide-react";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import PageTitle from "./PageTitle";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[540px] place-items-center rounded-xl bg-stone-200 text-sm text-muted-foreground">
      Loading map…
    </div>
  ),
});

const tabs = ["Map View", "Companies"];

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

export default function MapWrapper({ initialData = [], regions = [] }) {
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
                s.company.toLowerCase().includes(q),
            )
          : s.interns,
      }))
      .filter((s) => s.interns.length > 0);
  }, [companySites, regionId, query]);

  const selected = sites.find((s) => s.id === selectedId) ?? null;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <div className="flex gap-3 items-center justify-between">
        <PageTitle
          Icon={MapPin}
          title={"Student Map"}
          description={
            "Showing all the interns and their company across the map."
          }
        />

        <div className="flex rounded-lg bg-stone-200 p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-primary-500 text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {/* Search + location filter */}
        <div className="space-y-4 rounded-xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, company, course..."
              aria-label="Search student, company, course"
              className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-200 sm:max-w-md"
            />
          </div>

          <div className="space-y-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Locations
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setRegionId(null)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  !regionId
                    ? "bg-primary-500 text-primary-foreground"
                    : "bg-stone-200 text-muted-foreground hover:text-primary-500"
                }`}
              >
                All Locations
              </button>
              {regions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRegionId(r.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    regionId === r.id
                      ? "bg-primary-500 text-primary-foreground"
                      : "bg-stone-200 text-muted-foreground hover:text-primary-500"
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {tab === "Map View" ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="overflow-hidden rounded-xl border border-border bg-background p-2">
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

            <aside className="rounded-xl border border-border bg-background p-4">
              {selected ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-primary-foreground">
                      {selected.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-base font-bold">
                        {selected.company}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
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
                      <li key={i.id} className="rounded-lg bg-secondary/60 p-3">
                        <p className="text-sm font-semibold">{i.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {i.role} · {i.course}
                        </p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full bg-primary-500"
                            style={{ width: `${i.progress}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {i.progress}% complete · {i.period}
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-semibold">No company selected</p>
                  <p className="text-xs text-muted-foreground">
                    Click a pin on the map to see the students deployed there.
                  </p>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="space-y-5">
            {sites.map((s) => (
              <article
                key={s.id}
                className="rounded-xl border border-border bg-background p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-primary-foreground">
                      {s.initials}
                    </span>
                    <div className="min-w-0">
                      <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                        <Building2 className="h-4 w-4 text-primary-500" />
                        {s.company}
                      </h2>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {s.address}
                        {s.region_name ? `, ${s.region_name}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-border bg-stone-200 px-3 py-1 text-xs font-semibold text-foreground/80">
                    <Users className="h-3.5 w-3.5" /> {s.interns.length} ongoing
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {s.interns.map((i) => (
                    <div
                      key={i.id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-semibold">
                          {i.name}
                        </p>
                        <span className="shrink-0 text-xs font-semibold text-primary-500">
                          {i.progress}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {i.role} · {i.course}
                      </p>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${i.progress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
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
          <p className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            No interns match your filters.
          </p>
        )}
      </div>
    </main>
  );
}
