"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import {
  mapLocationsOptions,
  mapCompanyRouteOptions,
} from "@/lib/cache/map-locations-queries";
import { getInitials, formatPeriod } from "./mapSiteFormatting";
import useMapViewerLocation from "./useMapViewerLocation";
import { DEFAULT_MAP_ORIGIN } from "./mapVisitPlanning.mjs";

import { filterMapSites } from "./mapFilters.mjs";

const tabs = ["Map View", "Companies"];
const emptyCompanies = [];
// Join company queries, local search/region/department controls, selected sites and route state.
// Use the session's location origin when available, otherwise the configured campus origin.
export default function useMapLocationsView() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const locationsQuery = useQuery({
    ...mapLocationsOptions(user?.id),
    enabled: Boolean(user?.id),
  });
  const initialData = locationsQuery.data?.companies || emptyCompanies;
  const departments = locationsQuery.data?.availableDepartments || [];
  const [departmentId, setDepartmentId] = useState("");
  const regions = locationsQuery.data?.availableRegions || [];
  const [tab, setTab] = useState(tabs[0]);
  const [regionId, setRegionId] = useState(null); // null = "All Locations"
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [routeSiteId, setRouteSiteId] = useState(null);

  // Memoize the UI shape for each API response. The company/coordinate composite
  // identifies a grouped site; intern IDs remain actual internship record IDs.
  const companySites = useMemo(
    () =>
      initialData.map((c) => ({
        id: `${c.company_name}_${c.lat}_${c.lon}`,
        company: c.company_name,
        initials: getInitials(c.company_name),
        address: c.company_address,
        city_name: c.city_name,
        province_name: c.province_name,
        region_id: c.region_id,
        region_name: c.region_name,
        lat: Number(c.lat),
        lng: Number(c.lon),
        interns: c.interns.map((i) => ({
          id: i.internship_id,
          studentId: i.student_id,
          name: i.name,
          course: i.course,
          departmentId: i.department_id,
          courseShortName: i.course_short_name,
          role: i.position,
          progress: i.percent_complete,
          period: formatPeriod(i.date_started, i.date_ended),
        })),
      })),
    [initialData],
  );

  // One filtered set drives pins, company panels, city counts and recommendations.
  const sites = useMemo(() => filterMapSites(companySites, { regionId, departmentId, query }),
    [companySites, regionId, departmentId, query]);

  const selected = sites.find((s) => s.id === selectedId) ?? null;
  // Show route data only for the currently selected site still present in the filters.
  const routeSite = selected?.id === routeSiteId ? selected : null;
  const viewerLocation = useMapViewerLocation();
  const origin =
    viewerLocation.routePosition ||
    locationsQuery.data?.origin ||
    DEFAULT_MAP_ORIGIN;
  const routeQuery = useQuery(
    mapCompanyRouteOptions(user?.id, routeSite, origin.live ? origin : null),
  );
  // Resolve a success/failure result for panel handling. Retrying the active site
  // forces a fresh query; changing the site or live origin uses a distinct key.
  function showRoute(site) {
    setSelectedId(site.id);
    setRouteSiteId(site.id);
    setTab("Map View");
    const options = mapCompanyRouteOptions(user?.id, site, origin.live ? origin : null);
    return queryClient.fetchQuery(site.id === routeSite?.id ? { ...options, staleTime: 0 } : options)
      .then(() => ({ success: true }), () => ({ success: false }));
  }
  const blockingError = locationsQuery.isError && !locationsQuery.data;
  return {
    locationsQuery,
    regions,
    departments, departmentId, setDepartmentId,
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
    origin,
    viewerLocation,
    routeQuery,
    route: routeSite && routeQuery.data ? routeQuery.data : null,
    routeActive: Boolean(routeSite),
    showRoute,
    clearRoute: () => setRouteSiteId(null),
  };
}
