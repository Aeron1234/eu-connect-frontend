"use server";

import { getUserSession } from "./services";
import { revalidatePath } from "next/cache";

export async function createUser(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const userData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/accounts/new?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(userData),
      },
    );

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
    const session = await getUserSession();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const userId = session.user.id;
    const accountId = formData.get("accountId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/accounts/deactivate/${accountId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    console.log(res);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.error}`);
    }

    revalidatePath("/admin/accounts");
    return await res.json();
  } catch (err) {
    console.error("Deactivation Account Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function reactivateAccount(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const userId = session.user.id;
    const accountId = formData.get("accountId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/accounts/reactivate/${accountId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    console.log(res);
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.error}`);
    }

    const data = await res.json();
    if (res.ok) revalidatePath("/admin/accounts");

    return data;
  } catch (err) {
    console.error("Reactivation Account Error: ", err.message);
    return { success: false, error: err.message };
  }
}
