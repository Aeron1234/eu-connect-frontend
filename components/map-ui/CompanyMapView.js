"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { PanelLeftOpen } from "lucide-react";
import SelectedCompanyDrawer from "./SelectedCompanyDrawer";
import useSmallMapViewport from "./useSmallMapViewport";
import { Skeleton } from "@/components/ui/skeleton";
import SelectedCompanyPanel from "./SelectedCompanyPanel";
import MapDirections from "./MapDirections";

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
  const drawerOpen = smallScreen && Boolean(selected) && dismissedId !== selected.id;
  function selectCompany(id) {
    setDismissedId(null);
    setSelectedId(id);
  }
  function showSelectedRoute() {
    if (smallScreen) setDismissedId(selected.id);
    showRoute(selected);
  }
  const routeControls = selected && origin ? (
    <MapDirections site={selected} origin={origin} query={routeQuery} active={routeActive} onShowRoute={showSelectedRoute} onClearRoute={clearRoute} />
  ) : null;
  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="overflow-hidden rounded-xl border border-border bg-card p-2 shadow-sm">
        <Map
          className="h-[min(58dvh,420px)] min-h-[280px] w-full rounded-xl sm:h-[480px] lg:h-[540px]"
          sites={sites}
          selectedId={selectedId}
          onSelect={selectCompany}
          showCompanyPopups={!smallScreen}
          origin={origin}
          viewerPosition={viewerPosition}
          route={route}
        />
        {selected && <button ref={returnFocusRef} type="button" onClick={() => setDismissedId(null)} className="mt-2 inline-flex min-h-10 max-w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted lg:hidden" aria-haspopup="dialog" aria-expanded={drawerOpen}>
          <PanelLeftOpen className="size-4 shrink-0" /><span className="truncate">{selected.company} · Details</span>
        </button>}
        {routeActive && <div className="px-2 pb-2 lg:hidden" aria-label="Road route status">{routeControls}</div>}
        <p className="px-2 py-2 text-xs text-muted-foreground">
          Each pin shows the number of interns at that company — click a
          pin to see their names.
        </p>
        {route && <p className="px-2 pb-2 text-[11px] text-muted-foreground">Routes: <a href="https://routing.openstreetmap.de/about.html" target="_blank" rel="noopener noreferrer" className="underline">OSRM / FOSSGIS</a> · OpenStreetMap contributors · <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer" className="underline">Report a map issue</a></p>}
      </div>

      <div className="hidden lg:block"><SelectedCompanyPanel selected={selected} routeControls={routeControls} /></div>
      <SelectedCompanyDrawer open={drawerOpen} onOpenChange={(open) => { if (!open && selected) setDismissedId(selected.id); }} returnFocusRef={returnFocusRef}>
        {selected && <SelectedCompanyPanel selected={selected} routeControls={routeControls} embedded />}
      </SelectedCompanyDrawer>
    </div>
  );
}
