"use client";
import { recommendVisitCities, routeDistance } from './mapVisitPlanning.mjs';
export default function MapVisitRecommendations({ sites, origin, onShowRoute, embedded = false }) {
  const recommendations = recommendVisitCities(sites, origin);
  return <section aria-label="Visit recommendations" className={embedded ? "min-w-0" : "rounded-xl border border-border bg-card p-4 sm:p-5"}>
    {!embedded && <h2 className="text-base font-semibold text-foreground">Recommended first visits</h2>}
    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">More students first, across departments and current filters. Ties favor nearer companies from {origin.label}. Distances are straight-line; routes show driving time.</p>
    {!recommendations.length ? <p className="mt-3 text-sm text-muted-foreground">No classified city matches the current filters.</p> : <ol className={embedded ? "mt-4 divide-y divide-border" : "mt-4 grid gap-3 lg:grid-cols-3"}>
      {recommendations.map((group, index) => <li key={group.id} className={embedded ? "min-w-0 py-4 first:pt-0 last:pb-0" : "min-w-0 rounded-lg border border-border p-3"}>
        {!embedded && <p className="text-xs font-semibold text-primary-emphasis">{index === 0 ? 'Recommended first' : 'Then consider'}</p>}
        <h3 className={`${embedded ? "" : "mt-1 "}break-words text-sm font-semibold text-foreground`}>{index + 1}. {group.name}</h3>
        <p className="text-xs text-muted-foreground">{group.province}</p>
        <p className="mt-2 text-sm text-foreground">{group.studentCount} students · {group.companyCount} companies</p>
        {Number.isFinite(group.proximityMeters) && <p className="mt-1 text-xs text-muted-foreground">About {routeDistance(group.proximityMeters)} straight-line to the nearest company</p>}
        <button type="button" onClick={() => onShowRoute(group.firstSite)} className="mt-3 min-h-10 text-left text-xs font-semibold text-primary-emphasis hover:underline">Route to {group.firstSite.company}</button>
      </li>)}
    </ol>}
  </section>;
}
