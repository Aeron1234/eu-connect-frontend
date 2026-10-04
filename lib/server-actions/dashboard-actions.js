"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { throwApiError, toReadActionResult } from "../api-response";

export const getStudentDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-dashboard-data`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getStudentDashboardStats = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/dashboard-stats`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export const getPostedJobs = cache(async ({ page = 1 } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/posted-jobs?page=${page}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export const getEmployerDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("You must be logged in.");
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/employer-dashboard-data`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getAverageShiftHours = async ({ month, year } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("You must be logged in.");
    }

    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (year) params.set("year", year);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/average-shift-hours?${params.toString()}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getAvailableShiftHoursMonths = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("You must be logged in.");
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/available-shift-hours-months`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const getDepartmentHeadDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/department-head-dashboard-data`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

async function getDepartmentStudentHoursPage({ page = 1, courseId, search = "" } = {}) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("You must be logged in.");

  const params = new URLSearchParams({ page: String(page) });
  if (courseId) params.set("courseId", String(courseId));
  if (search) params.set("search", search);
  const res = await fetch(
    `${process.env.API_BASE_URL}/api/department-head-dashboard/hours-tracker?${params}`,
    { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) await throwApiError(res);
  return res.json();
}

export async function getDepartmentStudentHoursPageResult(options) {
  return toReadActionResult(getDepartmentStudentHoursPage, [options]);
}

export const getAdminDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/admin-dashboard-data`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export async function getAverageShiftHoursResult(...args) {
  return toReadActionResult(getAverageShiftHours, args);
}
