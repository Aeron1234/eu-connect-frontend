"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { getOngoingInternshipRecord } from "./internship-records-actions";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export const getWeeklyNarratives = async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!internshipId) throw new Error("Choose an internship record.");

    const res = await fetch(
      `${getApiBaseUrl()}/weekly-narratives/history?internshipId=${encodeURIComponent(internshipId)}&page=1`,
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

export const fetchMoreWeeklyNarratives = async ({ page = 1, internshipId } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!internshipId) throw new Error("Choose an internship record.");

    const res = await fetch(
      `${getApiBaseUrl()}/weekly-narratives/history?internshipId=${encodeURIComponent(internshipId)}&page=${page}`,
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

export async function createWeeklyNarrative(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) {
      return { success: false, error: "No ongoing internship found." };
    }

    const internshipId = internshipData?.id;

    const res = await fetch(
      `${getApiBaseUrl()}/weekly-narratives/new?internshipId=${internshipId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/narratives");
    return result;
  } catch (err) {
    console.error("createWeeklyNarrative failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function editWeeklyNarrative(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const narrativeId = formData.get("narrativeId");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) {
      return { success: false, error: "No ongoing internship found." };
    }

    const internshipId = internshipData?.id;

    const res = await fetch(
      `${getApiBaseUrl()}/weekly-narratives/${narrativeId}?internshipId=${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/narratives");
    return result;
  } catch (err) {
    console.error("editWeeklyNarrative failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteWeeklyNarrative(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const narrativeId = formData.get("narrativeId");

    const res = await fetch(
      `${getApiBaseUrl()}/weekly-narratives/${narrativeId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/narratives");
    return result;
  } catch (err) {
    console.error("deleteWeeklyNarrative failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getSearchedStudentWeeklyNarratives = async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/searched-user/weekly-narratives/${searchedUserId}?page=1`,
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

export const fetchMoreSearchedStudentWeeklyNarratives = async ({
  page = 1,
  searchedUserId,
} = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/searched-user/weekly-narratives/${searchedUserId}?page=${page}`,
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

export const getInternshipRecordWeeklyNarratives = async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${getApiBaseUrl()}/internship-records/weekly-narratives/${internshipId}`,
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


// Client interactions receive a serializable error; page reads throw.
export async function fetchMoreSearchedStudentWeeklyNarrativesResult(...args) {
  return toReadActionResult(fetchMoreSearchedStudentWeeklyNarratives, args);
}

export async function fetchMoreWeeklyNarrativesResult(...args) {
  return toReadActionResult(fetchMoreWeeklyNarratives, args);
}

export async function getInternshipRecordWeeklyNarrativesResult(...args) {
  return toReadActionResult(getInternshipRecordWeeklyNarratives, args);
}

export async function getSearchedStudentWeeklyNarrativesResult(...args) {
  return toReadActionResult(getSearchedStudentWeeklyNarratives, args);
}

export async function getWeeklyNarrativesResult(...args) {
  return toReadActionResult(getWeeklyNarratives, args);
}
