"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";
import { cache } from "react";
import { getAccessToken } from "./auth";
import { throwApiError, toReadActionResult } from "../api-response";

export const getRegions = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${getApiBaseUrl()}/regions`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export const getMapLocations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${getApiBaseUrl()}/student-map`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export async function getRegionsResult() {
  return toReadActionResult(getRegions, []);
}

export async function getMapLocationsResult() {
  return toReadActionResult(getMapLocations, []);
}

export async function getMapCompanyRoute(internshipId, origin = null, prepare = false) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("You must be logged in.");
  const params = new URLSearchParams();
  if (origin) { params.set("origin_lat", String(origin.lat)); params.set("origin_lng", String(origin.lng)); }
  if (prepare) params.set("prepare", "1");
  const query = params.size ? `?${params}` : "";
  const response = await fetch(`${getApiBaseUrl()}/student-map/route/${encodeURIComponent(internshipId)}${query}`, {
    headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
}

export async function getMapCompanyRouteResult(internshipId, origin = null) {
  return toReadActionResult(async (...args) => {
    try { return await getMapCompanyRoute(...args); }
    catch (error) {
      if (error?.name === "TimeoutError" || error?.name === "AbortError") {
        throw Object.assign(new Error("The route request timed out. Try again or use Google Maps."), { status: 504 });
      }
      throw error;
    }
  }, [internshipId, origin, true]);
}
