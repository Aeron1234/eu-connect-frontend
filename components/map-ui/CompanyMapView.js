"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import SelectedCompanyDrawer from "./SelectedCompanyDrawer";
import useSmallMapViewport from "./useSmallMapViewport";
import { Skeleton } from "@/components/ui/skeleton";
import SelectedCompanyPanel from "./SelectedCompanyPanel";
import MapDirections from "./MapDirections";
import CityVisitGroups from "./CityVisitGroups";
import MapCompanySlideout from "./MapCompanySlideout";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[min(58dvh,420px)] min-h-[280px] w-full rounded-xl sm:h-[480px] lg:h-[540px]" role="status" aria-label="Loading map" />
  ),
});
export default function CompanyMapView({ sites, selectedId, setSelectedId, selected, origin, viewerPosition = null, route = null, routeQuery, routeActive, showRoute, clearRoute }) {
  const smallScreen = useSmallMapViewport();
  const [dismissedId, setDismissedId] = useState(null);
  const returnFocusRef = useRef(null);
  const routeRequestRef = useRef(0);
  const detailsOpen = Boolean(selected) && dismissedId !== selected.id;
  const drawerOpen = smallScreen && detailsOpen;
  function selectCompany(id) {
    routeRequestRef.current++;
    setDismissedId(null);
    setSelectedId(id);
  }
  async function requestRoute(site) {
    const request = ++routeRequestRef.current;
    setDismissedId(null);
    const result = await showRoute(site);
    if (result?.success && request === routeRequestRef.current) setDismissedId(site.id);
  }
  function showSelectedRoute() { return requestRoute(selected); }
  function showCityRoute(site) {
    return requestRoute(site);
  }
  const routeControls = selected && origin ? (
    <MapDirections site={selected} origin={origin} query={routeQuery} active={routeActive} onShowRoute={showSelectedRoute} onClearRoute={clearRoute} />
  ) : null;
  return (
    <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="min-w-0 space-y-4">
      <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
        <div className="relative isolate overflow-hidden rounded-xl">
        <Map
          className="h-[min(58dvh,420px)] min-h-[280px] w-full rounded-xl sm:h-[480px] lg:h-[540px]"
          sites={sites}
          selectedId={selectedId}
          onSelect={selectCompany}
          showCompanyPopups={false}
          origin={origin}
          viewerPosition={viewerPosition}
          route={route}
        />
        <MapCompanySlideout open={!smallScreen && detailsOpen} companyId={selected?.id} onClose={() => { if (selected) setDismissedId(selected.id); }} returnFocusRef={returnFocusRef}>
          {selected && <SelectedCompanyPanel selected={selected} routeControls={routeControls} embedded />}
        </MapCompanySlideout>
        {selected && <button ref={returnFocusRef} type="button" onClick={() => setDismissedId(null)} tabIndex={detailsOpen ? -1 : 0} className={`absolute left-3 top-24 z-20 inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${detailsOpen ? "pointer-events-none opacity-0" : ""}`} aria-label={`Open company details: ${selected.company}`} title="Open company details" aria-haspopup={smallScreen ? "dialog" : undefined} aria-expanded={detailsOpen}>
          <PanelLeftOpen className="size-4" />
        </button>}
        </div>
        <p className="px-2 py-2 text-xs text-muted-foreground">
          Each pin shows the number of interns at that company — click a
          pin to see their names.
        </p>
        {route && <p className="px-2 pb-2 text-[11px] text-muted-foreground">Routes: <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener noreferrer" className="underline">OSRM / FOSSGIS</a> · OpenStreetMap contributors · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer" className="underline">Report a map issue</a></p>}
      </div>

      </div>
      <CityVisitGroups sites={sites} origin={origin} onShowRoute={showCityRoute} />
      <SelectedCompanyDrawer open={drawerOpen} onOpenChange={(open) => { if (!open && selected) setDismissedId(selected.id); }} returnFocusRef={returnFocusRef}>
        {selected && <SelectedCompanyPanel selected={selected} routeControls={routeControls} embedded />}
      </SelectedCompanyDrawer>
    </div>
  );
}
