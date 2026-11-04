"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { getErrorMessage, throwApiError, toReadActionResult } from "../api-response";

export const getAvailableAcademicYears = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/reports/academic-years`,
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

export async function getAvailableAcademicYearsResult() {
  return toReadActionResult(getAvailableAcademicYears, []);
}

export const getHteCompanyList = cache(
  async ({ academicYear = "", search = "", page = 1 }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const params = new URLSearchParams({ page: String(page) });
      if (academicYear) params.set("academicYear", academicYear);
      if (search) params.set("search", search);

      const res = await fetch(
        `${getApiBaseUrl()}/reports/hte-annual/companies?${params.toString()}`,
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
  },
);

export const getHteCompanyReport = cache(
  async ({ academicYear, companyKey }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${getApiBaseUrl()}/reports/hte-annual/company?academicYear=${academicYear}&companyKey=${companyKey}`,
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
  },
);

export const saveAnnexCReport = async (payload) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(`${getApiBaseUrl()}/reports/annex-c`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while saving Annex C report." };
  }
};

export const getAnnexCReports = async ({
  academicYear = "",
  search = "",
  status = "",
  page = 1,
} = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("You must be logged in.");
    }

    const params = new URLSearchParams({ page: String(page) });
    if (academicYear) params.set("academicYear", academicYear);
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const res = await fetch(
      `${getApiBaseUrl()}/reports/annex-c?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" },
    );

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
};

export const deleteAnnexCReport = async (reportId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${getApiBaseUrl()}/reports/annex-c/${reportId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deleting report." };
  }
};


// Client interactions receive a serializable error; page reads throw.
export async function getAnnexCReportsResult(...args) {
  return toReadActionResult(getAnnexCReports, args);
}

export async function getHteCompanyListResult(...args) {
  return toReadActionResult(getHteCompanyList, args);
}
