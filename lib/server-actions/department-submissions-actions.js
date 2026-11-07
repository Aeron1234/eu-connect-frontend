"use server";

import { getAccessToken } from "./auth";
import { getApiBaseUrl } from "../api-base-url.mjs";
import { throwApiError } from "../api-response";

export async function getDepartmentSubmissions(filters = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error("You must be logged in.");
  const params = new URLSearchParams();
  for (const key of ["page", "type", "search", "company", "courseId", "internshipId", "from", "through"]) {
    if (filters[key]) params.set(key, String(filters[key]));
  }
  const response = await fetch(`${getApiBaseUrl()}/department-submissions?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
}
