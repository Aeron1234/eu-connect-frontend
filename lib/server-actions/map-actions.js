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
