"use server";

import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";

export async function requestSupervisor(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

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

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.error || "Failed to send request.",
      };
    }

    revalidatePath("/users/[userId]");
    return await res.json(); // { success, message, id }
  } catch (err) {
    console.error("Request supervisor error:", err);
    return { success: false, error: "Failed to send request." };
  }
}

export async function cancelSupervisorRequest(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const requestId = formData.get("requestId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/supervisor-requests/${requestId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.error || "Failed to cancel request.",
      };
    }

    revalidatePath("/users/[userId]");
    return await res.json();
  } catch (err) {
    console.error("Cancel supervisor request error:", err);
    return { success: false, error: "Failed to cancel request." };
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error || "Failed to get supervisor status. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get supervisor status error:", err);
    return { error: "Failed to get supervisor status. Please try again." };
  }
};

export async function respondToSupervisorRequest(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

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

    const data = await res.json();
    if (res.ok) revalidatePath("/notifications");

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}
