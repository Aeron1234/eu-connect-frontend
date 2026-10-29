"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";
import { getAccessToken } from "./auth";
import { parseApiResponse } from "../api-response";

export async function getHelpAdminContacts() {
  try {
    const token = await getAccessToken();
    if (!token) return { error: "Your session has expired. Please sign in again.", status: 401 };
    const response = await fetch(`${getApiBaseUrl()}/help/admin-contacts`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    return { ...await parseApiResponse(response), status: response.status };
  } catch {
    return { error: "Could not load administrator contacts. Please try again.", status: 0 };
  }
}
