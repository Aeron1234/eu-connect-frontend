"use server";

import { cache } from "react";
import { getAccessToken, getUserSession } from "./auth";
import { revalidatePath } from "next/cache";
import { parseApiResponse, getErrorMessage } from "../api-response";

export const getUserProfile = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/account/user`, {
      method: "GET",
      cache: "no-store",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    return null;
  }
});

export const getSearchedUserProfile = cache(async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/${searchedUserId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
        // The response varies by viewer (supervision), so it must never
        // be cached by searchedUserId alone across requests. cache() still
        // dedupes it within a single request.
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.log(err);
    return null;
  }
});

export async function updateUserInfo(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    const session = await getUserSession();
    if (!accessToken || !session?.user) {
      return { success: false, error: "You must be logged in." };
    }

    const userRole = session.user.role;
    const userInfo = Object.fromEntries(formData);

    const res = await fetch(`${process.env.API_BASE_URL}/api/account/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userInfo),
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath(`/${userRole}/account`);
    return result;
  } catch (err) {
    console.error("updateUserInfo failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function updatePassword(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    const session = await getUserSession();
    if (!accessToken || !session?.user) {
      return { success: false, error: "You must be logged in." };
    }

    const userRole = session.user.role;
    const newPassword = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/account/update-password`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newPassword),
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath(`/${userRole}/account`);
    return result;
  } catch (err) {
    console.error("updatePassword failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getAvailableAvatars = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(`${process.env.API_BASE_URL}/api/avatars`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    return await res.json().catch(() => null);
  } catch (err) {
    console.error("Get available avatars error:", err);
    return { error: "Failed to get avatars. Please try again." };
  }
};

export async function updateUserAvatar(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const avatar = formData.get("avatar");

    const res = await fetch(`${process.env.API_BASE_URL}/api/profile/avatar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ avatar }),
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/accounts"); // now gated on success
    return result;
  } catch (err) {
    console.error("updateUserAvatar failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteUserAvatar(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(`${process.env.API_BASE_URL}/api/profile/avatar`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/accounts");
    return result;
  } catch (err) {
    console.error("deleteUserAvatar failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export const getAllAccounts = cache(
  async ({ filter = "all", search = "", page = 1 } = {}) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/accounts?filter=${filter}&search=${search}&page=${page}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) {
        return { error: await getErrorMessage(res) };
      }

      const data = await res.json().catch(() => null);
      return data || {};
    } catch (err) {
      console.log(err);
      return null;
    }
  },
);

export const getCreateAccountFormData = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/create-account-form-data`,
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
    console.error("Get create account form data error:", err);
    return { error: "Failed to load account form data. Please try again." };
  }
};

export async function createUser(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const userData = Object.fromEntries(formData);

    const res = await fetch(`${process.env.API_BASE_URL}/api/accounts/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/accounts");
    return result;
  } catch (error) {
    console.error("createUser failed:", error);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deactivateAccount(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    if (!formData || typeof formData.get !== "function") {
      return { success: false, error: "Invalid form submission." };
    }

    const accountId = formData.get("accountId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/accounts/deactivate/${accountId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/create-account");
    return result;
  } catch (err) {
    console.error("deactivateAccount failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function reactivateAccount(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    if (!formData || typeof formData.get !== "function") {
      return { success: false, error: "Invalid form submission." };
    }

    const accountId = formData.get("accountId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/accounts/reactivate/${accountId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/admin/create-account");
    return result;
  } catch (err) {
    console.error("reactivateAccount failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}
