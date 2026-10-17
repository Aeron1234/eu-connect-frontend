"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { throwApiError, toReadActionResult } from "../api-response";

export const getStudentDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/student-dashboard-data`,
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

    const res = await fetch(`${getApiBaseUrl()}/dashboard-stats`, {
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
      `${getApiBaseUrl()}/posted-jobs?page=${page}`,
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

export async function getPostedJobsResult(...args) {
  return toReadActionResult(getPostedJobs, args);
}

export const getEmployerDashboardData = async ({ jobPage = 1 } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("You must be logged in.");
    }

    const res = await fetch(
      `${getApiBaseUrl()}/employer-dashboard-data${jobPage > 1 ? `?jobPage=${jobPage}` : ""}`,
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
      `${getApiBaseUrl()}/average-shift-hours?${params.toString()}`,
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
      `${getApiBaseUrl()}/available-shift-hours-months`,
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
      `${getApiBaseUrl()}/department-head-dashboard-data`,
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

async function getEmployerInternsPage({ page = 1, status = "all" } = {}) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("You must be logged in.");

  const params = new URLSearchParams({ page: String(page), status });
  const res = await fetch(
    `${getApiBaseUrl()}/employer-dashboard/interns?${params}`,
    { method: "GET", headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) await throwApiError(res);
  return res.json();
}

export async function getEmployerInternsPageResult(options) {
  return toReadActionResult(getEmployerInternsPage, [options]);
}

async function getDepartmentStudentHoursPage({ page = 1, courseId, search = "" } = {}) {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error("You must be logged in.");

  const params = new URLSearchParams({ page: String(page) });
  if (courseId) params.set("courseId", String(courseId));
  if (search) params.set("search", search);
  const res = await fetch(
    `${getApiBaseUrl()}/department-head-dashboard/hours-tracker?${params}`,
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
      `${getApiBaseUrl()}/admin-dashboard-data`,
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

export async function getStudentDashboardDataResult() {
  return toReadActionResult(getStudentDashboardData, []);
}

export async function getStudentDashboardStatsResult() {
  return toReadActionResult(getStudentDashboardStats, []);
}

export async function getEmployerDashboardDataResult() {
  return toReadActionResult(getEmployerDashboardData, []);
}

export async function getDepartmentHeadDashboardDataResult() {
  return toReadActionResult(getDepartmentHeadDashboardData, []);
}

export async function getAdminDashboardDataResult() {
  return toReadActionResult(getAdminDashboardData, []);
}

export async function getAverageShiftHoursResult(...args) {
  return toReadActionResult(getAverageShiftHours, args);
}
