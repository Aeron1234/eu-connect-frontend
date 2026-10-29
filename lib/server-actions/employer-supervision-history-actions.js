"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";
import { parseApiResponse } from "../api-response";
import { getAccessToken } from "./auth";

export async function getEmployerSupervisionHistory(employerId, page = 1) {
  try {
    const token = await getAccessToken();
    if (!token) return { error: "Your session has expired. Please log in again.", status: 401 };
    if (typeof employerId !== "string" || !employerId || !Number.isInteger(page) || page < 1 || page > 1000000) {
      return { error: "Choose a valid employer and history page.", status: 400 };
    }
    const response = await fetch(`${getApiBaseUrl()}/searched-user/${encodeURIComponent(employerId)}/supervised-interns?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    return { ...await parseApiResponse(response), status: response.status };
  } catch (error) {
    return { error: "Could not load supervised interns. Please try again.", status: ["TimeoutError", "AbortError"].includes(error?.name) ? 504 : 0 };
  }
}
