"use client";

import { MapPin } from "lucide-react";
import ErrorUI from "@/components/ui/ErrorUI";
import useMapLocationsView from "./useMapLocationsView";
import StudentMapHeader from "./StudentMapHeader";
import MapLocationsLoading from "./MapLocationsLoading";
import MapLocationFilters from "./MapLocationFilters";
import CompanyMapView from "./CompanyMapView";
import CompanySiteCard from "./CompanySiteCard";

export default function MapWrapper() {
  const {
    locationsQuery,
    regions,
    tab,
    setTab,
    query,
    setQuery,
    regionId,
    setRegionId,
    selectedId,
    setSelectedId,
    sites,
    selected,
    blockingError,
    tabs,
  } = useMapLocationsView();

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <StudentMapHeader tabs={tabs} tab={tab} setTab={setTab} />

      {locationsQuery.isError && locationsQuery.data && (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-card p-4 text-sm">
          The latest map update could not be loaded. Showing the last available data.
          <button
            type="button"
            onClick={() => void locationsQuery.refetch()}
            className="ml-3 font-semibold text-primary-emphasis"
          >Try again</button>
        </div>
      )}
      {locationsQuery.isPending ? (
        <MapLocationsLoading />
      ) : blockingError ? (
        <ErrorUI error={locationsQuery.error} reset={() => void locationsQuery.refetch()} logError={false} />
      ) : <div className="space-y-6">
        {/* Search + location filter */}

        <MapLocationFilters
          query={query}
          setQuery={setQuery}
          regions={regions}
          regionId={regionId}
          setRegionId={setRegionId}
        />

        {tab === "Map View" ? (
          <CompanyMapView sites={sites} selectedId={selectedId} setSelectedId={setSelectedId} selected={selected} />
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {sites.map((s) => <CompanySiteCard key={s.id} site={s} />)}
          </div>
        )}

        {sites.length === 0 && (
          <div
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center"
          >
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
