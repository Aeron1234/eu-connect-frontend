"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { parseApiResponse, getErrorMessage } from "../api-response";

export async function requestSupervisor(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const employerId = formData.get("employerId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ employerId }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) {
      revalidatePath(`/users/${encodeURIComponent(employerId)}`);
    }
    return result; // { success, message, id }
  } catch (err) {
    console.error("requestSupervisor failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function cancelSupervisorRequest(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const requestId = formData.get("requestId");
    const employerId = formData.get("employerId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests/${requestId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) {
      revalidatePath(
        employerId ? `/users/${encodeURIComponent(employerId)}` : "/users/[userId]",
        employerId ? undefined : "page",
      );
    }
    return result;
  } catch (err) {
    console.error("cancelSupervisorRequest failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getSupervisorStatus = async (employerId = "") => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-status/${employerId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error("Get supervisor status error:", err);
    return { error: "Failed to get supervisor status. Please try again." };
  }
};

export async function respondToSupervisorRequest(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const requestId = formData.get("requestId");
    const decision = formData.get("decision");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests/respond/${requestId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ decision }),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/notifications");
    return result;
  } catch (err) {
    console.error("respondToSupervisorRequest failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}
