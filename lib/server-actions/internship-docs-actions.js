"use server";
import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";

export async function uploadInternshipFile(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/new`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      },
    );

    const data = await res.json();
    if (res.ok) revalidatePath("/student/storage");

    return data;
  } catch (err) {
    console.log(err.message);
    return { success: false, error: err.message };
  }
}

export async function approveInternshipDocument(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const fileId = formData.get("fileId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/files/${fileId}/accept`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (res.ok) revalidatePath("/student/storage");

    return await res.json();
  } catch (err) {
    console.error("Accept Document Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteFile(prevState, formData) {
  // Added prevState for useActionState compatibility

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const fileId = Number(formData.get("fileId"));
    // const filePath = formData.get("filePath");

    // if (!fileId || !filePath) throw new Error("Missing file information.");

    // const encodedPath = encodeURIComponent(filePath);

    const res = await fetch(`${process.env.API_BASE_URL}/api/file/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (res.ok) revalidatePath("/student/storage");

    return data;
  } catch (err) {
    console.error("Delete Error:", err.message);
    return { success: false, error: err.message };
  }
}

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

export async function uploadCertificateOfCompletion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const searchedUserId = formData.get("searchedUserId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${searchedUserId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // no Content-Type — fetch sets multipart/form-data with the
          // correct boundary automatically when body is a FormData instance
        },
        body: formData,
      },
    );

    if (res.ok) {
      revalidatePath("/users/[userId]");
    }

    return await res.json();
  } catch (err) {
    console.error("Upload certificate error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteEmployerCertificate(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in");

    const searchedUserId = formData.get("searchedUserId");
    const fileId = formData.get("fileId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/searched-user/files/${fileId}/${searchedUserId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/users/[userId]");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete pending student evaluation error: ", err.message);
    return { success: false, error: err.message };
  }
}

export const getInternshipRecordDocuments = cache(async (internshipId) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("You must be logged in.");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/documents/${internshipId}`,
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
          "Failed to get the internship record's evaluations. Please try again.",
      };
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
});

export const downloadInternshipRecordDocuments = async (
  prevState,
  formData,
) => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const { fileId, internshipId } = formData;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship-records/files/download/${internshipId}/${fileId}`,
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
