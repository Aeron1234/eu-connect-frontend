"use server";
// import { auth } from "./auth";
import { cache } from "react";
import { getAccessToken, getUserSession } from "./auth";

// export const getUserSession = cache(async () => {
//   const session = await auth();

//   return session;
// });

export const getOngoingInternshipRecord = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/active`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/active/all?userId=${userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

export const getMyPastInternshipRecords = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/my-past-internships`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
});

export const getInternshipRecords = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/internships/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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

export const getDtrToday = async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/today?internshipId=${internshipId}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/status?internshipId=${internshipId}`,
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
        error: error.message || "Record not found or you haven't clock-in yet.",
      };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
};

export const getMySettedDtrLocation = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const internshipId = internshipData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/dtr/setted-location?internshipId=${internshipId}`,
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
        error: error.message || "Failed to fetch setted dtr location.",
      };
    }

    const data = await res.json();

    return data || null;
  } catch (err) {
    return null;
  }
});

export const getFileRequirementTypes = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/requirements`,
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
        error: error.message || "Failed to get the file requirement types.",
      };
    }

    const data = await res.json();

    return data || [];
  } catch (err) {
    return null;
  }
});

export const getInternshipFiles = cache(
  async ({ internshipId, category = "" }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/internships/files?internshipId=${internshipId}&category=${category}`,
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
            error.message ||
            "No Internship related files found or you haven't uploaded any yet.",
        };
      }

      const data = await res.json();

      return data || [];
    } catch (err) {
      return null;
    }
  },
);

export async function downloadInternshipFile(prevState, formData) {
  try {
    const fileId = formData.fileId; // formData is your plain object {fileId: id} here, not a real FormData

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/${fileId}/download`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
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
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/announcements/history?category=${category}&page=${page}&search=${search}`,
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
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/announcements/history?category=${category}&page=${page}&search=${search}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/categories`,
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

export const getRoles = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/roles`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/regions`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/courses`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/departments`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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

export const getInbox = async ({
  scope = "all",
  page = 1,
  limit = 10,
} = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const params = new URLSearchParams({
      scope,
      page: String(page),
      limit: String(limit),
    });

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.message || "Failed to load notifications.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const fetchMoreNotifications = cache(async ({ page = 1 }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/notifications?page=${page}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-evaluation/criteria`,
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
          error.message ||
          "Failed to get evaluation criterias. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getEmployerEvaluationCriterias = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluation-criterias`,
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
          error.message ||
          "Failed to get evaluation criterias. Please try again.",
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/student-past-evaluations/${searchedUserId}`,
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

export const getStudentPendingEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/pending`,
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
          error.message ||
          "Failed to get pending evaluations. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getAllEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/evaluations/all`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      return {
        error:
          error.message || "Failed to get all evaluations. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const getDisputedEvaluations = cache(async () => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/evaluations/disputed`,
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
          error.message ||
          "Failed to get disputed evaluations. Please try again.",
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(`${process.env.API_BASE_URL}/api/dashboard-stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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

export const getSearchHistory = cache(async ({ type }) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/search-history?type=${type}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/dtrs/${searchedUserId}?limit=${limit}&offset=${offset}`,
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

export const getSearchedStudentWeeklyNarratives = async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/weekly-narratives/${searchedUserId}?page=1`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error || "Failed to get narratives. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Get searched student weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};

export const fetchMoreSearchedStudentWeeklyNarratives = async ({
  page = 1,
  searchedUserId,
} = {}) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/weekly-narratives/${searchedUserId}?page=${page}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      const error = await res.json();
      return {
        error: error.error || "Failed to get narratives. Please try again.",
      };
    }

    return await res.json();
  } catch (err) {
    console.error("Fetch more searched student weekly narratives error:", err);
    return { error: "Failed to get narratives. Please try again." };
  }
};

export const getSearchedStudentDtrLocation = cache(async (searchedUserId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/set-dtr-location/${searchedUserId}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${searchedUserId}`,
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
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const { searchedUserId, fileId } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${fileId}/${searchedUserId}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
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
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/employer-uploaded-files/${searchedUserId}`,
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

export const getInternshipPosts = cache(
  async ({
    workType = "",
    courseId = "",
    search = "",
    mine = "",
    page = 1,
  }) => {
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("You must be logged in.");

      const params = new URLSearchParams({
        workType,
        courseId,
        search,
        mine,
        page,
      });

      const res = await fetch(
        `${process.env.API_BASE_URL}/api/internship-postings?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        const error = await res.json();
        return {
          error:
            error.message ||
            "Failed to get internship posts. Please try again.",
        };
      }

      const data = await res.json();

      return data;
    } catch (err) {
      console.log(err);
      return null;
    }
  },
);

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
