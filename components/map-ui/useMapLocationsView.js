"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import {
  mapLocationsOptions,
  mapCompanyRouteOptions,
} from "@/lib/cache/map-locations-queries";
import { getInitials, formatPeriod } from "./mapSiteFormatting";
import useMapViewerLocation from "./useMapViewerLocation";
import { DEFAULT_MAP_ORIGIN } from "./mapVisitPlanning.mjs";

const tabs = ["Map View", "Cities", "Companies"];
const emptyCompanies = [];
export default function useMapLocationsView() {
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
  const [routeSiteId, setRouteSiteId] = useState(null);

  // Normalize the API's company shape into what the map/list UI expects,
  // once — stable composite id since the API doesn't provide one
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
  const routeSite = selected?.id === routeSiteId ? selected : null;
  const viewerLocation = useMapViewerLocation();
  const origin =
    viewerLocation.routePosition ||
    locationsQuery.data?.origin ||
    DEFAULT_MAP_ORIGIN;
  const routeQuery = useQuery(
    mapCompanyRouteOptions(user?.id, routeSite, origin.live ? origin : null),
  );
  function showRoute(site) {
    setSelectedId(site.id);
    setRouteSiteId(site.id);
    setTab("Map View");
    if (site.id === routeSite?.id) void routeQuery.refetch();
  }
  const blockingError = locationsQuery.isError && !locationsQuery.data;
  return {
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
    origin,
    viewerLocation,
    routeQuery,
    route: routeSite && routeQuery.data ? routeQuery.data : null,
    routeActive: Boolean(routeSite),
    showRoute,
    clearRoute: () => setRouteSiteId(null),
  };
}
