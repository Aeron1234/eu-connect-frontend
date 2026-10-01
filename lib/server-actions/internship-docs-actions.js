"use server";
import { revalidatePath } from "next/cache";
import { getAccessToken } from "./auth";
import { cache } from "react";
import { parseApiResponse, getErrorMessage } from "../api-response";

export async function uploadInternshipFile(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internships/files/new`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/storage");
    return result;
  } catch (err) {
    console.error("uploadInternshipFile failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function approveInternshipDocument(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    const fileId = formData.get("fileId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/files/${fileId}/accept`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/storage");
    return result;
  } catch (err) {
    console.error("approveInternshipDocument failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteFile(prevState, formData) {
  // Added prevState for useActionState compatibility
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

    if (!formData || typeof formData.get !== "function") {
      return { success: false, error: "Invalid form submission." };
    }

    const fileId = Number(formData.get("fileId"));

    const res = await fetch(`${process.env.API_BASE_URL}/api/file/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const result = await parseApiResponse(res);
    if (result.success) revalidatePath("/student/storage");
    return result;
  } catch (err) {
    console.error("deleteFile failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
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
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    if (!res.ok) {
      return { error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
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
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      if (!res.ok) {
        return { error: await getErrorMessage(res) };
      }

      const data = await res.json().catch(() => null);
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
      return { success: false, error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return {
      success: true,
      url: data?.url,
      fileName: data?.fileName,
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
      return { success: false, error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return {
      success: true,
      url: data?.url,
      fileName: data?.fileName,
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
        headers: { Authorization: `Bearer ${accessToken}` },
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

export async function uploadCertificateOfCompletion(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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

    const result = await parseApiResponse(res);
    // NOTE: literal "[userId]" placeholder, not the resolved path — this
    // won't actually revalidate the intended route. Left as-is since the
    // real searchedUserId/route isn't resolvable from here.
    if (result.success) revalidatePath("/users/[userId]");
    return result;
  } catch (err) {
    console.error("uploadCertificateOfCompletion failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
  }
}

export async function deleteEmployerCertificate(prevState, formData) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return { success: false, error: "You must be logged in." };
    }

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

    const result = await parseApiResponse(res);
    // Same literal-placeholder note as above.
    if (result.success) revalidatePath("/users/[userId]");
    return result;
  } catch (err) {
    console.error("deleteEmployerCertificate failed:", err);
    return {
      success: false,
      error: "Couldn't reach the server. Check your connection and try again.",
    };
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
        headers: { Authorization: `Bearer ${accessToken}` },
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
      return { success: false, error: await getErrorMessage(res) };
    }

    const data = await res.json().catch(() => null);
    return {
      success: true,
      url: data?.url,
      fileName: data?.fileName,
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
