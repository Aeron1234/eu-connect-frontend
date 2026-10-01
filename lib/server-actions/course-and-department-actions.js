"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "../api-response";

export const getCourses = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/courses`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return data || [];
  } catch (err) {
    return null;
  }
});

export const getDepartments = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/departments`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return data || [];
  } catch (err) {
    return null;
  }
});

export async function activateDepartment(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/departments/${id}/activate`,
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
      `${process.env.API_BASE_URL}/api/departments/${id}/deactivate`,
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
      `${process.env.API_BASE_URL}/api/courses/${id}/activate`,
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
      `${process.env.API_BASE_URL}/api/courses/${id}/deactivate`,
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

    const res = await fetch(`${process.env.API_BASE_URL}/api/departments`, {
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

    const res = await fetch(`${process.env.API_BASE_URL}/api/courses`, {
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
