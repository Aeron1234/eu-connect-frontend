"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";
import { parseApiResponse, throwApiError, toReadActionResult } from "@/lib/api-response";

function restoreInternshipRecordUrl(internshipId) {
  return `${process.env.API_BASE_URL}/api/internship-records/restore/${internshipId}`;
}

export const getOngoingInternshipRecord = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/active`,
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
});

export async function createInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(`${process.env.API_BASE_URL}/api/internships/new`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/internship-record");
    return result;
  } catch (err) {
    console.error("createInternshipRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteOwnInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const internshipId = formData.get("internshipId");
    if (!internshipId) {
      return { success: false, error: "Internship record ID is required." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/mine/${encodeURIComponent(internshipId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const result = await parseApiResponse(res);
    if (result.success) {
      revalidatePath("/student/internship-record");
      revalidatePath("/student");
    }
    return result;
  } catch (err) {
    console.error("deleteOwnInternshipRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function finishInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const internshipId = formData.get("id");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/finish/${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student");
    return result;
  } catch (err) {
    console.error("finishInternshipRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getMyPastInternshipRecords = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/my-past-internships`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) await throwApiError(res);
    return (await res.json()) || [];
  } catch (error) {
    throw error;
  }
});

export async function getOngoingInternshipRecordResult() {
  return toReadActionResult(getOngoingInternshipRecord, []);
}

export async function getMyPastInternshipRecordsResult(...args) {
  return toReadActionResult(getMyPastInternshipRecords, args);
}

export const getInternshipRecords = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/internships/all`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) await throwApiError(res);

    return await res.json();
  } catch (error) {
    throw error;
  }
});

export async function getInternshipRecordsResult() {
  return toReadActionResult(getInternshipRecords, []);
}

export async function approveInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const internshipId = formData.get("id");
    const status = formData.get("status");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship/${internshipId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internship-records");
    return result;
  } catch (err) {
    console.error("approveInternshipRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function restoreInternshipRecord(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const internshipId = formData.get("id");

    const res = await fetch(
      restoreInternshipRecordUrl(internshipId),
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath(`/internship-records/${internshipId}`);
    return result;
  } catch (err) {
    console.error("restoreInternshipRecord failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function updateInternshipRecordStatus(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const internshipId = formData.get("id");
    const status = formData.get("status");

    let url;
    let body;

    if (["ongoing", "rejected"].includes(status)) {
      url = `${process.env.API_BASE_URL}/api/internship/${internshipId}`;
      body = { status };
    } else if (status === "pending") {
      url = restoreInternshipRecordUrl(internshipId);
      body = null;
    } else if (status === "finished") {
      url = `${process.env.API_BASE_URL}/api/internship-records/${internshipId}/finish`;
      body = null;
    } else {
      return { success: false, error: "Invalid status." };
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/internship-records");
    return result;
  } catch (err) {
    console.error("updateInternshipRecordStatus failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getDepartmentInternshipRecords = async ({
  status = "",
  search = "",
  page = 1,
  limit = 10,
}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const params = new URLSearchParams({ status, search, page, limit });

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/department?${params.toString()}`,
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

export const getInternshipRecordOverview = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/overview/${internshipId}`,
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
export async function getDepartmentInternshipRecordsResult(...args) {
  return toReadActionResult(getDepartmentInternshipRecords, args);
}
