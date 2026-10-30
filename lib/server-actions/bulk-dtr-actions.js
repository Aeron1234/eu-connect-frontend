"use server";

import { getAccessToken } from './auth';
import { getApiBaseUrl } from '../api-base-url.mjs';
import { parseApiResponse } from '../api-response';
import { revalidatePath } from 'next/cache';

async function request(path, body) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, status: 401, error: 'Your session has expired. Please log in again.' };
    const response = await fetch(`${getApiBaseUrl()}/dtr-locations/${path}`, {
      method: body ? 'POST' : 'GET', cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(body ? 45000 : 20000),
    });
    const result = { ...await parseApiResponse(response), status: response.status };
    if (body && result.success) { revalidatePath('/dtr-locations'); revalidatePath('/student'); }
    return result;
  } catch {
    return { success: false, status: 502, error: body ? 'Could not confirm the assignments. Refresh the table and map before retrying; the save may have completed.' : 'Could not load DTR locations. Please try again.' };
  }
}
export async function getBulkDtrStudents(filters) { return request(`students?${new URLSearchParams(filters)}`); }
export async function getBulkDtrPins(filters) { return request(`pins?${new URLSearchParams(filters)}`); }
export async function assignBulkDtrLocations(body) { return request('assign', body); }
