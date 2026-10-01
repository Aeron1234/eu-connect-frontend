"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { getOngoingInternshipRecord } from "./internship-records-actions";
import { parseApiResponse, getErrorMessage } from "../api-response";

export const getWeeklyNarratives = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData?.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/weekly-narratives/history?internshipId=${internshipId}&page=1`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error("Get weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};

export const fetchMoreWeeklyNarratives = async ({ page = 1 } = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData?.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/weekly-narratives/history?internshipId=${internshipId}&page=${page}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error("Fetch more weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};

export async function createWeeklyNarrative(prevState, formData) {
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
      `${process.env.API_BASE_URL}/api/weekly-narratives/new?internshipId=${internshipId}`,
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

export async function editWeeklyNarrative(prevState, formData) {
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
      `${process.env.API_BASE_URL}/api/weekly-narratives/${narrativeId}?internshipId=${internshipId}`,
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

export async function deleteWeeklyNarrative(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const narrativeId = formData.get("narrativeId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/weekly-narratives/${narrativeId}`,
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
      `${process.env.API_BASE_URL}/api/searched-user/weekly-narratives/${searchedUserId}?page=1`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error("Get searched student weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
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
      `${process.env.API_BASE_URL}/api/searched-user/weekly-narratives/${searchedUserId}?page=${page}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error("Fetch more searched student weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};

export const getInternshipRecordWeeklyNarratives = async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/weekly-narratives/${internshipId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error("Get internship record weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};
