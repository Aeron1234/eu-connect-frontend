"use server";

import { cache } from "react";
import { getAccessToken, getUserSession } from "./auth";
import { revalidatePath } from "next/cache";

export const getUserProfile = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/account/user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "User doesn't exist." };
    }

    return await res.json();
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // The response now varies by viewer (supervision), so it must never
        // be cached by searchedUserId alone across requests. cache() still
        // dedupes it within a single request.
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message ||
          error.error ||
          "Failed to get searched user profile. Please try again.",
      };
    }

    const data = await res.json();

    return data;
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
      throw new Error("You must be logged in.");
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

    const data = await res.json();
    if (res.ok) revalidatePath(`/${userRole}/account`);

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function updatePassword(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    const session = await getUserSession();
    if (!accessToken || !session?.user) {
      throw new Error("You must be logged in.");
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

    const data = await res.json();
    if (res.ok) revalidatePath(`/${userRole}/account`);

    return data;
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
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
      const error = await res.json();
      return {
        error: error.error || "Failed to get avatars. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get available avatars error:", err);
    return { error: "Failed to get avatars. Please try again." };
  }
};

export async function updateUserAvatar(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const avatar = formData.get("avatar");

    const res = await fetch(`${process.env.API_BASE_URL}/api/profile/avatar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ avatar }),
    });

    revalidatePath("/admin/accounts");
    return await res.json();
  } catch (err) {
    console.error("Update avatar error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteUserAvatar(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/profile/avatar`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.ok) revalidatePath("/admin/accounts");
    return await res.json();
  } catch (err) {
    console.error("Delete avatar error:", err.message);
    return { success: false, error: err.message };
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
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!res.ok) {
        const error = await res.json();
        return {
          error: error.message || "Failed to get accounts. Please try again.",
        };
      }

      const data = await res.json();
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
      const error = await res.json();
      return {
        error:
          error.error || "Failed to load account form data. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get create account form data error:", err);
    return { error: "Failed to load account form data. Please try again." };
  }
};

export async function createUser(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const userData = Object.fromEntries(formData);

    const res = await fetch(`${process.env.API_BASE_URL}/api/accounts/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.error}`);
    }

    const data = await res.json();
    if (res.ok) revalidatePath("/admin/accounts");

    return data;
  } catch (error) {
    console.log(error);
    return { success: false, error: error.message };
  }
}

export async function deactivateAccount(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
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

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    revalidatePath("/admin/create-account");
    return await res.json();
  } catch (err) {
    console.error("Deactivation Account Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function reactivateAccount(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
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

    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    const data = await res.json();
    if (res.ok) revalidatePath("/admin/create-account");

    return data;
  } catch (err) {
    console.error("Reactivation Account Error: ", err.message);
    return { success: false, error: err.message };
  }
}
