"use server";
import { getAccessToken } from './auth';
import { getApiBaseUrl } from '../api-base-url.mjs';
export async function readDuty(params = {}) {
    try {
        const token = await getAccessToken();
        if (!token)
            return { success: false, error: 'Please sign in.' };
        const response = await fetch(`${getApiBaseUrl()}/dtr/duty?${new URLSearchParams(params)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const data = await response.json();
        return response.ok ? { success: true, ...data } : { success: false, error: data.error || 'Could not load duty information.' };
    }
    catch {
        return { success: false, error: 'Could not reach the server. Try again.' };
    }
}
export async function saveDuty(input) {
    try {
        const token = await getAccessToken();
        if (!token)
            return { success: false, error: 'Please sign in.' };
        const response = await fetch(`${getApiBaseUrl()}/dtr/duty`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
        const data = await response.json();
        return response.ok ? data : { success: false, error: data.error || 'Could not save.' };
    }
    catch {
        return { success: false, error: 'Could not confirm the save. Refresh before retrying.' };
    }
}
