"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";

// Relay authenticated, uncached calendar requests. Returned error objects keep
// failed mutations distinct from success and prevent success-only revalidation.
async function calendarRequest(path, options = {}) {
  const token = await getAccessToken();
  if (!token) return { error: "Your session has expired. Please log in again." };
  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { error: data.error || "Calendar request failed." };
    return data;
  } catch {
    return { error: "Couldn't reach the calendar server. Please try again." };
  }
}

export async function getCalendarMonth(month) {
  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return { error: "Invalid month." };
  }
  return calendarRequest(`/calendar?month=${month}`);
}

export async function getCalendarSchedule(id) {
  if (!/^\d+$/.test(String(id))) return { error: "Invalid schedule." };
  return calendarRequest(`/calendar/schedules/${id}`);
}

export async function createCalendarTodo(input) {
  const result = await calendarRequest("/calendar/todos", { method: "POST", body: JSON.stringify(input) });
  if (result.success) revalidatePath("/calendar");
  return result;
}

export async function updateCalendarTodo(id, input) {
  const result = await calendarRequest(`/calendar/todos/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (result.success) revalidatePath("/calendar");
  return result;
}

export async function deleteCalendarTodo(id) {
  const result = await calendarRequest(`/calendar/todos/${id}`, { method: "DELETE" });
  if (result.success) revalidatePath("/calendar");
  return result;
}

export async function createCalendarSchedule(input) {
  const result = await calendarRequest("/calendar/schedules", { method: "POST", body: JSON.stringify(input) });
  if (result.success) revalidatePath("/calendar");
  return result;
}

export async function updateCalendarSchedule(id, input) {
  const result = await calendarRequest(`/calendar/schedules/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  if (result.success) revalidatePath("/calendar");
  return result;
}

export async function deleteCalendarSchedule(id) {
  const result = await calendarRequest(`/calendar/schedules/${id}`, { method: "DELETE" });
  if (result.success) revalidatePath("/calendar");
  return result;
}
