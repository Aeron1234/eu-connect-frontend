"use server";

import { cache } from "react";
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

export const getAllEvaluationCriteria = cache(async ({ type = "employer" }) => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }
    const userId = session.user.id;

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation";
    } else {
      API_ROUTE = "criteria/employer-evaluation";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}?userId=${userId}&includeInactive=true`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          error.message ||
          "Failed to fetch evaluation criteria.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    // Normalized to the same { error } shape as the !res.ok branch above,
    // so callers only ever need to check one shape instead of three.
    return { error: err.message || "Failed to fetch evaluation criteria." };
  }
});

export async function addCriterion(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const type = formData.get("type");
    const category = formData.get("category");
    const criterion_name = formData.get("criterion_name");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation";
    } else {
      API_ROUTE = "criteria/employer-evaluation";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({ category, criterion_name }),
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error || error.message || "Failed to add new criterion.",
      };
    }

    revalidatePath("/admin/evaluation-criteria");
    return await res.json();
  } catch (error) {
    console.error("Add criterion error:", error.message);
    return { success: false, error: error.message };
  }
}

export async function deactivateCriterion(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["admin"].includes(session.user.role))
      throw new Error("Unauthorized.");

    const userId = session.user.id;

    const criterionId = formData.get("id");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation";
    } else {
      API_ROUTE = "criteria/employer-evaluation";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${criterionId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Deactivate criterion error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function reactivateCriterion(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["admin"].includes(session.user.role))
      throw new Error("Unauthorized.");

    const userId = session.user.id;

    const criterionId = formData.get("id");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = `criteria/student-evaluation/${criterionId}/reactivate`;
    } else {
      API_ROUTE = `criteria/employer-evaluation/${criterionId}/reactivate`;
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Reactivate criterion error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function deactivateSection(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["admin"].includes(session.user.role))
      throw new Error("Unauthorized.");

    const userId = session.user.id;

    const category = formData.get("category");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation/section";
    } else {
      API_ROUTE = "criteria/employer-evaluation/section";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${encodeURIComponent(category)}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Deactivate section error:", err.message);
    return { success: false, error: err.message };
  }
}

export async function reactivateSection(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user || !["admin"].includes(session.user.role))
      throw new Error("Unauthorized.");

    const userId = session.user.id;

    const category = formData.get("category");
    const type = formData.get("type");

    if (!["student", "employer"].includes(type)) {
      throw new Error("Evaluations is for student and employers only.");
    }

    // FIXED: was `criteria/{type}-evaluation/${category}/deactivate`, which
    // is missing the `/section/` segment and used the wrong verb — it
    // matched no route on the Express side (404 every time). The real
    // route is PATCH /criteria/{type}-evaluation/section/:category/reactivate.
    let API_ROUTE = "";
    if (type === "student") {
      API_ROUTE = "criteria/student-evaluation/section";
    } else {
      API_ROUTE = "criteria/employer-evaluation/section";
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${encodeURIComponent(category)}/reactivate?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      revalidatePath("/admin/evaluation-criteria");
    }

    return data;
  } catch (err) {
    console.error("Reactivate section error:", err.message);
    return { success: false, error: err.message };
  }
}
