"use server";

import { getAccessToken } from './auth';
import { getApiBaseUrl } from '../api-base-url.mjs';
import { parseApiResponse } from '../api-response';
import { revalidatePath } from 'next/cache';

async function request(path, body) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, status: 401, error: 'Your session has expired. Please log in again.' };
    const response = await fetch(`${getApiBaseUrl()}/dtr-restrictions/${path}`, {
      method: body ? 'POST' : 'GET', cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(body ? 45000 : 20000),
    });
    const result = { ...await parseApiResponse(response), status: response.status };
    if (body && result.success) { revalidatePath('/dtr-restrictions'); revalidatePath('/student'); }
    return result;
  } catch {
    return { success: false, status: 502, error: body ? 'Could not confirm the assignments. Refresh the table and map before retrying; the save may have completed.' : 'Could not load DTR locations. Please try again.' };
  }
}
export async function getBulkDtrStudents(filters) { return request(`students?${new URLSearchParams(filters)}`); }
export async function getBulkDtrPins(filters) { return request(`pins?${new URLSearchParams(filters)}`); }
export async function assignBulkDtrLocations(body) { return request('assign', body); }

export async function updateDtrShiftSchedule(internshipId, schedule) {
  try {
    const token = await getAccessToken();
    if (!token) return { success: false, error: 'Please log in again.' };
    const response = await fetch(`${getApiBaseUrl()}/dtr-restrictions/${encodeURIComponent(internshipId)}/schedule`, {
      method: schedule ? 'PUT' : 'DELETE', cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: schedule ? JSON.stringify(schedule) : undefined,
      signal: AbortSignal.timeout(20000),
    });
    return await parseApiResponse(response);
  } catch {
    return { success: false, error: 'Could not confirm the schedule change. Refresh before trying again.' };
  }
}
