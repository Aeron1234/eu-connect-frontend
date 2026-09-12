"use server";

import { cache } from "react";
import { getAccessToken } from "./auth";
import { revalidatePath } from "next/cache";

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

export const getAllEvaluationCriteria = cache(async ({ type = "employer" }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

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
      `${process.env.API_BASE_URL}/api/${API_ROUTE}?includeInactive=true`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

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

    const res = await fetch(`${process.env.API_BASE_URL}/api/${API_ROUTE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ category, criterion_name }),
    });

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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

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
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${criterionId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

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

    const res = await fetch(`${process.env.API_BASE_URL}/api/${API_ROUTE}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

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
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${encodeURIComponent(category)}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

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
      `${process.env.API_BASE_URL}/api/${API_ROUTE}/${encodeURIComponent(category)}/reactivate`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
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

export async function activateDepartment(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/departments/${id}/activate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.error || "Failed to activate department." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while activating department." };
  }
}

export async function deactivateDepartment(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/departments/${id}/deactivate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.error || "Failed to deactivate department." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deactivating department." };
  }
}

export async function activateCourse(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/courses/${id}/activate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.error || "Failed to activate course." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while activating course." };
  }
}

export async function deactivateCourse(id) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/courses/${id}/deactivate`,
      { method: "PATCH", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.error || "Failed to deactivate course." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deactivating course." };
  }
}

export async function addDepartment({ name, code }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(`${process.env.API_BASE_URL}/api/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ name, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to add department." };
    }

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while adding department." };
  }
}

export async function addCourse({ course_name, short_name, department_id }) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(`${process.env.API_BASE_URL}/api/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ course_name, short_name, department_id }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Failed to add course." };
    }

    return data;
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while adding course." };
  }
}

export const getAllActivityLogs = cache(
  async ({
    action = "",
    actorRole = "",
    targetType = "",
    search = "",
    page = 1,
  } = {}) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) return { error: "Not signed in." };

      const params = new URLSearchParams({ page: String(page) });
      if (action) params.set("action", action);
      if (actorRole) params.set("actorRole", actorRole);
      if (targetType) params.set("targetType", targetType);
      if (search) params.set("search", search);

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/activity-logs?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return { error: error.error || "Failed to load activity logs." };
      }

      return await res.json();
    } catch (err) {
      console.error(err);
      return { error: "Unexpected error while loading activity logs." };
    }
  },
);

export const deleteActivityLog = async (logId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "Not signed in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/activity-logs/${logId}`,
      { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return { error: error.error || "Failed to delete activity log." };
    }

    return await res.json();
  } catch (err) {
    console.error(err);
    return { error: "Unexpected error while deleting activity log." };
  }
};

export const getAdminDashboardStats = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/admin-dashboard-stats`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get admin dashboard stats. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get admin dashboard stats error:", err);
    return { error: "Failed to get admin dashboard stats. Please try again." };
  }
};

export const getUserGrowthOverTime = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(`${process.env.API_BASE_URL}/api/user-growth`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error || "Failed to get user growth data. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get user growth error:", err);
    return { error: "Failed to get user growth data. Please try again." };
  }
};

export const getUsersByRole = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(`${process.env.API_BASE_URL}/api/users-by-role`, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error || "Failed to get users by role. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get users by role error:", err);
    return { error: "Failed to get users by role. Please try again." };
  }
};

export const getOngoingInternshipsByDepartment = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships-by-department`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error ||
          "Failed to get internships by department. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get internships by department error:", err);
    return {
      error: "Failed to get internships by department. Please try again.",
    };
  }
};

export const getRecentSystemActivity = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { error: "You must be logged in." };

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/admin-recent-activity`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.error || "Failed to get recent activity. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get recent system activity error:", err);
    return { error: "Failed to get recent activity. Please try again." };
  }
};
