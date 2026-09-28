"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { getOngoingInternshipRecord } from "./internship-records-actions";

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
      const error = await res.json();
      return {
        error: error.error || "Failed to get narratives. Please try again.",
      };
    }

    return await res.json();
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
      const error = await res.json();
      return {
        error: error.error || "Failed to get narratives. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Fetch more weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};

export async function createWeeklyNarrative(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData?.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/weekly-narratives/new?internshipId=${internshipId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      },
    );

    if (res?.ok) revalidatePath("/student/narratives");

    return await res.json();
  } catch (err) {
    console.error("Create weekly narrative error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function editWeeklyNarrative(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const narrativeId = formData.get("narrativeId");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

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

    if (res?.ok) revalidatePath("/student/narratives");

    return await res.json();
  } catch (err) {
    console.error("Edit weekly narrative error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteWeeklyNarrative(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const narrativeId = formData.get("narrativeId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/weekly-narratives/${narrativeId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (res?.ok) revalidatePath("/student/narratives");

    return await res.json();
  } catch (err) {
    console.error("Delete weekly narrative error:", err.message);
    return { success: false, error: err.message };
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
      const error = await res.json();
      return {
        error: error.error || "Failed to get narratives. Please try again.",
      };
    }

    return await res.json();
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
      const error = await res.json();
      return {
        error: error.error || "Failed to get narratives. Please try again.",
      };
    }

    return await res.json();
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
      const error = await res.json();
      return {
        error: error.error || "Failed to get narratives. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get internship record weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};
