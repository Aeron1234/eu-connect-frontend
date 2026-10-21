"use client";

import { useEffect, useState } from 'react';
import { LocateFixed, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import MapViewerLocationControls from './MapViewerLocationControls';
import MapVisitRecommendations from './MapVisitRecommendations';

const triggerClass = 'inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

export default function MapPlanningTools({ sites, origin, viewerLocation, onShowRoute }) {
  const [locationOpen, setLocationOpen] = useState(false);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    function closeOnDesktop() {
      if (desktop.matches) { setLocationOpen(false); setRecommendationsOpen(false); }
    }
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);
  if (!origin) return null;
  function showRecommendedRoute(site) {
    setRecommendationsOpen(false);
    onShowRoute(site);
  }
  return <>
    <div className="space-y-2 lg:hidden" aria-label="Map tools">
      <div className={viewerLocation ? 'grid grid-cols-2 gap-2' : 'grid gap-2'}>
        {viewerLocation && <Modal title="Route starting point" trigger={<><LocateFixed className="size-4 shrink-0" />Location</>}
          triggerStyles={triggerClass} open={locationOpen} onOpenChange={setLocationOpen}>
          <MapViewerLocationControls location={viewerLocation} origin={origin} embedded />
        </Modal>}
        <Modal title="Visit recommendations" trigger={<><Sparkles className="size-4 shrink-0" />Recommendations</>}
          triggerStyles={triggerClass} open={recommendationsOpen} onOpenChange={setRecommendationsOpen}>
          <MapVisitRecommendations sites={sites} origin={origin} onShowRoute={showRecommendedRoute} embedded />
        </Modal>
      </div>
      <p className="truncate text-[11px] text-muted-foreground" title={origin.label}>Starting point: {origin.label}</p>
    </div>
    <div className="hidden space-y-6 lg:block">
      {viewerLocation && <MapViewerLocationControls location={viewerLocation} origin={origin} />}
      <MapVisitRecommendations sites={sites} origin={origin} onShowRoute={onShowRoute} />
    </div>
  </>;
}
