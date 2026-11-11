"use server";

import { getAccessToken } from "./auth";
import { getApiBaseUrl } from "../api-base-url.mjs";
import { throwApiError } from "../api-response";

export async function getCompanyEvaluationSummary(filters = {}, companyKey = "") {
  const token = await getAccessToken();
  if (!token) throw new Error("You must be logged in.");
  const params = new URLSearchParams();
  for (const field of ["courseId", "from", "through", "sort", "page"]) {
    if (filters[field]) params.set(field, String(filters[field]));
  }
  const route = companyKey ? `/evaluations/company/summary/${encodeURIComponent(companyKey)}` : "/evaluations/company/summary";
  const response = await fetch(`${getApiBaseUrl()}${route}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) await throwApiError(response);
  return response.json();
}
