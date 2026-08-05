"use server";
import { auth } from "./auth";
import { cache } from "react";

export const getUserSession = cache(async () => {
  const session = await auth();

  return session;
});

export const getOngoingInternshipRecord = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/active?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "No ongoing internship found" };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
});

// For the Map Page, we need to fetch all ongoing internships for the department head
export const getActiveInternships = cache(async () => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/active/all?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "No ongoing internship found" };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export const getInternshipRecords = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/all?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "No internship records found." };
    }

    return await res.json();
  } catch (err) {
    return null;
  }
});

export const getUserProfile = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;
    const res = await fetch(
      `${process.env.API_BASE_URL}/api/account/user?userId=${userId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return { error: error.message || "User doesn't exist." };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
});

export const getDtrToday = async () => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const userId = session.user.id;
    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/today?userId=${userId}&internshipId=${internshipId}`,
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
        error: error.message || "Record not found or you haven't clock-in yet.",
      };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
};

// NEW: Optimized for checking status without downloading the whole history
export const getLatestDtrStatus = async () => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const userId = session.user.id;
    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/status?userId=${userId}&internshipId=${internshipId}`,
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
        error: error.message || "Record not found or you haven't clock-in yet.",
      };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
};

export const getFileRequirementTypes = cache(async () => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "employer", "department_head", "admin"].includes(
        session.user.role,
      )
    ) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/requirements?userId=${userId}`,
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
        error: error.message || "Failed to get the file requirement types.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export const getInternshipFiles = cache(async () => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files?userId=${userId}`,
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
          error.message ||
          "No Internship related files found or you haven't uploaded any yet.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export async function downloadInternshipFile(prevState, formData) {
  try {
    const fileId = formData.fileId; // formData is your plain object {fileId: id} here, not a real FormData

    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "department_head", "admin"].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }
    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/${fileId}/download?userId=${userId}`,
      {
        method: "GET",
        headers: { "x-api-key": process.env.BACKEND_SECRET_KEY },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error: error.error || "Download failed. Please try again.",
      };
    }

    const data = await res.json();
    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      message: "File was opened / downloaded.",
    };
  } catch (err) {
    console.error("Download error:", err);
    return { success: false, error: "Download failed. Please try again." };
  }
}

export const getAllAnnouncements = cache(
  async ({ category = "all", page = 1, search = "" }) => {
    try {
      const session = await getUserSession();
      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      const userId = session.user.id;

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/announcements/history?userId=${userId}&category=${category}&page=${page}&search=${search}`,
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
            error.message || "Failed to get announcements. Please try again.",
        };
      }

      const data = await res.json();

      return data || [];
    } catch (err) {
      console.log(err);
      return null;
    }
  },
);

export const fetchMoreAnnouncements = cache(
  async ({ category = "all", page = 1, search = "" }) => {
    try {
      const session = await getUserSession();
      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      const userId = session.user.id;

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/announcements/history?userId=${userId}&category=${category}&page=${page}&search=${search}`,
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
            error.message ||
            "Failed to load more announcements. Please try again.",
        };
      }

      const data = await res.json();

      return data || [];
    } catch (err) {
      console.log(err);
      return null;
    }
  },
);

export const getAnnouncementCategories = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/categories?userId=${userId}`,
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
          error.message ||
          "Failed to get announcement categories. Please try again.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export const getAllAccounts = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    // ROLES : 1 = Student, 2 = Employer, 3 = Department Head, 4 = Admin

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/accounts?userId=${userId}`,
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
        error: error.message || "Failed to get all accounts. Please try again.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getRoles = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/roles?userId=${userId}`,
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
        error: error.message || "Failed to get roles. Please try again.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export const getRegions = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/regions?userId=${userId}`,
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
        error: error.message || "Failed to get regions. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    return null;
  }
});

export const getCourses = cache(async () => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "employer", "department_head", "admin"].includes(
        session.user.role,
      )
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/courses?userId=${userId}`,
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
        error: error.message || "Failed to get courses. Please try again.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export const getDepartments = cache(async () => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "student", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/departments?userId=${userId}`,
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
        error: error.message || "Failed to get courses. Please try again.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export const getInbox = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications?userId=${userId}`,
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
          error.message || "Failed to get notifications. Please try again.",
      };
    }

    const data = await res.json();

    // return await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const fetchMoreNotifications = cache(async ({ page = 1 }) => {
  try {
    const session = await getUserSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications?userId=${userId}&page=${page}`,
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
          error.message ||
          "Failed to get more notifications. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getStudentEvaluationCriterias = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["employer"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation/criteria?userId=${userId}`,
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
          error.message ||
          "Failed to get more notifications. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getStudentPastEvaluations = cache(async (searchedUserId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "employer", "department_head", "admin"].includes(
        session.user.role,
      )
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-past-evaluations/${searchedUserId}?userId=${userId}`,
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
          error.message ||
          "Failed to get more notifications. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getStudentDashboardStats = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["student"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dashboard-stats?userId=${userId}`,
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
          error.message || "Failed to get dashboard stats. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getSearchedUserProfile = cache(async (searchedUserId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "employer", "department_head", "admin"].includes(
        session.user.role,
      )
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/${searchedUserId}?userId=${userId}`,
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
          error.message ||
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

export const getSearchHistory = cache(async ({ type }) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["student", "employer", "department_head", "admin"].includes(
        session.user.role,
      )
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/search-history?userId=${userId}&type=${type}`,
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
          error.message || "Failed to get search history. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getSearchedStudentDTRs = cache(async (searchedUserId, page) => {
  const limit = 5;

  const validatedPage = Math.max(1, parseInt(page));
  const offset = (validatedPage - 1) * limit;
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["employer", "department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/dtrs/${searchedUserId}?userId=${userId}&limit=${limit}&offset=${offset}`,
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
          error.message ||
          "Failed to get searched user's DTR. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getSearchedStudentNarratives = cache(async (searchedUserId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["employer", "department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/narratives/${searchedUserId}?userId=${userId}`,
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
          error.message ||
          "Failed to get searched user's Narratives. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export async function fetchMoreSearchedStudentNarratives({
  searchedUserId,
  page,
}) {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["employer", "department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/narratives/${searchedUserId}?userId=${userId}&page=${page}`,
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
          error.message ||
          "Failed to get more of searched user's Narratives. Please try again.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    console.log(err);
    return null;
  }
}

export const getSearchedStudentDtrLocation = cache(async (searchedUserId) => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["employer", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${searchedUserId}?userId=${userId}`,
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
          error.message ||
          "Failed to get searched user setted location for DTR. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getSearchedStudentFiles = cache(async (searchedUserId) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["department_head", "admin"].includes(session.user.role)
    ) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${searchedUserId}?userId=${userId}`,
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
          error.message ||
          "Failed to get searched user's files. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const downloadSearchedStudentFiles = async (prevState, formData) => {
  try {
    const session = await getUserSession();
    if (
      !session?.user ||
      !["employer", "department_head", "admin"].includes(session.user.role)
    ) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    const { searchedUserId, fileId } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${fileId}/${searchedUserId}?userId=${userId}`,
      {
        method: "GET",
        headers: { "x-api-key": process.env.BACKEND_SECRET_KEY },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        success: false,
        error:
          error.error || "Failed to open / download file. Please try again.",
      };
    }

    const data = await res.json();
    return {
      success: true,
      url: data.url,
      fileName: data.fileName,
      message: "File opened / downloaded successfully.",
    };
  } catch (err) {
    console.error("Download searched student file error:", err);
    return {
      success: false,
      error: "Failed to open / download file. Please try again.",
    };
  }
};

export const getEmployerUploadedFiles = cache(async (searchedUserId) => {
  try {
    const session = await getUserSession();
    if (!session?.user || !["employer", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/employer-uploaded-files/${searchedUserId}?userId=${userId}`,
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
          error.message ||
          "Failed to get searched user's files. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getInternshipPosts = cache(async () => {
  try {
    const session = await getUserSession();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // const base = `${process.env.API_BASE_URL}/api/internship-postings`;
    // const query = `userId=${userId}&workType=${workType}&courseId=${courseId}&search=${search}&mine=${mine}&page=${page}&limit=${limit}`;
    // const apiUrl = `${base}?${query}`;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-postings?userId=${userId}`,
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
          error.message || "Failed to get internship posts. Please try again.",
      };
    }

    const data = await res.json();

    // return await res.json();
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});
