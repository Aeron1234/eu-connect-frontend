"use server";

import { revalidatePath } from "next/cache";
import { cache } from "react";
import { getAccessToken } from "./auth";

export const getAvailableAcademicYears = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/academic-years`,
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
          error.message ||
          "Failed to get available academic year. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getHteCompanyList = cache(
  async ({ academicYear = "", search = "", page = 1 }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const params = new URLSearchParams({ page: String(page) });
      if (academicYear) params.set("academicYear", academicYear);
      if (search) params.set("search", search);

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/reports/hte-annual/companies?${params.toString()}`,
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
            error.error || "Failed to get HTE company list. Please try again.",
        };
      }

      return await res.json();
    } catch (err) {
      console.error(err);
      return { error: "Unexpected error while loading HTE reports." };
    }
  },
);

export const getHteCompanyReport = cache(
  async ({ academicYear, companyKey }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/reports/hte-annual/company?academicYear=${academicYear}&companyKey=${companyKey}`,
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
            error.message ||
            "Failed to get HTE company list. Please try again.",
        };
      }

      const data = await res.json();

      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
);

export const saveAnnexCReport = async (payload) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(`${process.env.API_BASE_URL}/api/reports/annex-c`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.error || "Failed to save Annex C report." };
    }

    revalidatePath("/department_head/sipp-reports");
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while saving Annex C report." };
  }
};

export const getAnnexCReports = async ({
  academicYear = "",
  search = "",
  page = 1,
} = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const params = new URLSearchParams({ page: String(page) });
    if (academicYear) params.set("academicYear", academicYear);
    if (search) params.set("search", search);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/annex-c?${params.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.error || "Failed to load Annex C reports." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while loading Annex C reports." };
  }
};

export const deleteAnnexCReport = async (reportId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/reports/annex-c/${reportId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.error || "Failed to delete report." };
    }

    revalidatePath("/department_head/sipp-reports");
    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deleting report." };
  }
};
