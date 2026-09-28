"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";

export const getStudentDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-dashboard-data`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get student dashboard data. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get student dashboard data error:", err);
    return {
      error: "Failed to get student dashboard data. Please try again.",
    };
  }
};

export const getStudentDashboardStats = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/dashboard-stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message || "Failed to get dashboard stats. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error || "Failed to get posted jobs. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get posted jobs error:", err);
    return { error: "Failed to get posted jobs. Please try again." };
  }
});

export const getEmployerDashboardStats = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/employer-dashboard-stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get employer dashboard stats. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get employer dashboard stats error:", err);
    return {
      error: "Failed to get employer dashboard stats. Please try again.",
    };
  }
};

export const getEmployerDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/employer-dashboard-data`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get employer dashboard data. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get employer dashboard data error:", err);
    return {
      error: "Failed to get employer dashboard data. Please try again.",
    };
  }
};

export const getDepartmentHeadDashboardStats = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/department-head-dashboard-stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get department head dashboard stats. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get department head dashboard stats error:", err);
    return {
      error: "Failed to get department head dashboard stats. Please try again.",
    };
  }
};

export const getAverageShiftHours = async ({ month, year } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const params = new URLSearchParams();
    if (month) params.set("month", month);
    if (year) params.set("year", year);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/average-shift-hours?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error || "Failed to get average shift hours. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get average shift hours error:", err);
    return { error: "Failed to get average shift hours. Please try again." };
  }
};

export const getAvailableShiftHoursMonths = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/available-shift-hours-months`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error || "Failed to get available months. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get available shift hours months error:", err);
    return { error: "Failed to get available months. Please try again." };
  }
};

export const getDepartmentHeadDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/department-head-dashboard-data`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get department head dashboard data. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get department head dashboard data error:", err);
    return {
      error: "Failed to get department head dashboard data. Please try again.",
    };
  }
};

export const getAdminDashboardStats = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/admin-dashboard-stats`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get admin dashboard stats. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get admin dashboard stats error:", err);
    return { error: "Failed to get admin dashboard stats. Please try again." };
  }
};

export const getAdminDashboardData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/admin-dashboard-data`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get admin dashboard data. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get admin dashboard data error:", err);
    return { error: "Failed to get admin dashboard data. Please try again." };
  }
};
