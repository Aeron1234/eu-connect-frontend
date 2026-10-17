"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";
import { getErrorMessage, throwApiError, toReadActionResult } from "../api-response";

export const getCourses = cache(async ({ includeInactive = false } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${getApiBaseUrl()}/courses${includeInactive ? "?includeInactive=true" : ""}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    const data = await res.json();
    return data || [];
  } catch (error) {
    throw error;
  }
});

export const getDepartments = cache(async ({ includeInactive = false } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${getApiBaseUrl()}/departments${includeInactive ? "?includeInactive=true" : ""}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    const data = await res.json();
    return data || [];
  } catch (error) {
    throw error;
  }
});

export async function getCoursesResult(...args) {
  return toReadActionResult(getCourses, args);
}

export async function getDepartmentsResult(...args) {
  return toReadActionResult(getDepartments, args);
}

export async function activateDepartment(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${getApiBaseUrl()}/departments/${id}/activate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    revalidatePath("/admin/departments-and-courses");
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while activating department." };
  }
}

export async function deactivateDepartment(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${getApiBaseUrl()}/departments/${id}/deactivate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    revalidatePath("/admin/departments-and-courses");
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deactivating department." };
  }
}

export async function activateCourse(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${getApiBaseUrl()}/courses/${id}/activate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    revalidatePath("/admin/departments-and-courses");
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while activating course." };
  }
}

export async function deactivateCourse(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${getApiBaseUrl()}/courses/${id}/deactivate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    revalidatePath("/admin/departments-and-courses");
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deactivating course." };
  }
}

export async function addDepartment({ name, code }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(`${getApiBaseUrl()}/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name, code }),
    });

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    revalidatePath("/admin/departments-and-courses");
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while adding department." };
  }
}

export async function addCourse({ course_name, short_name, department_id }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(`${getApiBaseUrl()}/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ course_name, short_name, department_id }),
    });

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    revalidatePath("/admin/departments-and-courses");
    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while adding course." };
  }
}

async function updateLookup(kind, id, body) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };
    const res = await fetch(`${getApiBaseUrl()}/${kind}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) return { error: await getErrorMessage(res) };
    revalidatePath("/admin/departments-and-courses");
    return await res.json();
  } catch (error) {
    console.error(error);
    return { error: `Unexpected error while updating ${kind === "courses" ? "course" : "department"}.` };
  }
}

export async function updateDepartment(id, values) {
  return updateLookup("departments", id, values);
}

export async function updateCourse(id, values) {
  return updateLookup("courses", id, values);
}
