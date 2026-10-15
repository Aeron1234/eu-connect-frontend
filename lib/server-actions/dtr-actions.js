"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { getOngoingInternshipRecord } from "./internship-records-actions";
import { cache } from "react";
import { parseApiResponse, throwApiError, toReadActionResult } from "../api-response";

export const getDtrToday = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) return null;

    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/today?internshipId=${internshipId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    const data = await res.json();
    return data || null;
  } catch (error) {
    throw error;
  }
};

// NEW: Optimized for checking status without downloading the whole history
export const getLatestDtrStatus = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) return null;

    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/status?internshipId=${internshipId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    const data = await res.json();
    return data || null;
  } catch (error) {
    throw error;
  }
};

export const getDtrs = cache(async (page = 1) => {
  const limit = 5;

  const validatedPage = Math.max(1, parseInt(page));
  const offset = (validatedPage - 1) * limit;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const internshipId = internship.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/history?internshipId=${internshipId}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) await throwApiError(res);

    const data = await res.json();
    return data || [];
  } catch (error) {
    throw error;
  }
});

export async function clockIn(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    // 1. Check if they have an internship
    const internship = await getOngoingInternshipRecord();
    if (!internship) {
      return { success: false, error: "No ongoing internship found." };
    }

    const internshipId = internship.id;

    const lat_in = formData.get("lat_in");
    const lon_in = formData.get("lon_in");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/clock-in?internshipId=${internshipId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lat_in, lon_in }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student");
    return result;
  } catch (err) {
    console.error("clockIn failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function clockOut(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) {
      return { success: false, error: "No ongoing internship found." };
    }

    const internshipId = internshipData.id;

    const lat_out = formData.get("lat_out");
    const lon_out = formData.get("lon_out");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/clock-out?internshipId=${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lat_out, lon_out }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student");
    return result;
  } catch (err) {
    console.error("clockOut failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

async function changeBreakState(path, method) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "You must be logged in." };

    const res = await fetch(`${process.env.API_BASE_URL}/api/dtr/break/${path}`, {
      method,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student");
    return result;
  } catch (err) {
    console.error(`Break ${path} failed:`, err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function startBreak() {
  return changeBreakState("start", "POST");
}

export async function resumeDuty() {
  return changeBreakState("resume", "PATCH");
}

export async function deleteDtr(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    if (!formData || typeof formData.get !== "function") {
      return { success: false, error: "Invalid form submission." };
    }

    const dtrId = Number(formData.get("dtrId"));

    const res = await fetch(`${process.env.API_BASE_URL}/api/dtr/${dtrId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student");
    return result;
  } catch (err) {
    console.error("deleteDtr failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getSearchedStudentDTRs = cache(
  async (searchedUserId, page = 1) => {
    const limit = 5;

    const validatedPage = Math.max(1, parseInt(page));
    const offset = (validatedPage - 1) * limit;
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/searched-user/dtrs/${searchedUserId}?limit=${limit}&offset=${offset}`,
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

export const getSearchedStudentDtrLocation = cache(async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${searchedUserId}`,
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

export async function setStudentDtrLocation(formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    // NOTE: reads formData as a plain object (formData.studentId, not
    // formData.get("studentId")) — unlike every other action in this file.
    // Left as-is; flagging in case the caller is expected to pass FormData.
    const studentId = formData.studentId;
    const internshipId = formData.internshipId;
    const data = {
      lat: formData.lat,
      lon: formData.lon,
      label: formData.label,
      radius_meter: formData.radius_meter,
      address: formData.address,
    };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${studentId}?internshipId=${internshipId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/users");
    return result;
  } catch (err) {
    console.error("setStudentDtrLocation failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getInternshipRecordDtr = cache(async (internshipId, page = 1) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/dtr/${internshipId}?page=${page}`,
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


// Client interactions receive a serializable error; page reads throw.
export async function getDtrsResult(...args) {
  return toReadActionResult(getDtrs, args);
}

export async function removeStudentDtrLocation(studentId, internshipId) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { success: false, error: "You must be logged in." };
    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${studentId}?internshipId=${encodeURIComponent(internshipId)}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/users");
    return result;
  } catch (error) {
    console.error("removeStudentDtrLocation failed:", error);
    return { success: false, error: "Could not remove DTR location." };
  }
}

export async function getInternshipRecordDtrResult(...args) {
  return toReadActionResult(getInternshipRecordDtr, args);
}

export async function getSearchedStudentDTRsResult(...args) {
  return toReadActionResult(getSearchedStudentDTRs, args);
}

export async function getSearchedStudentDtrLocationResult(...args) {
  return toReadActionResult(getSearchedStudentDtrLocation, args);
}
