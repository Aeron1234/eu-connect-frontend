"use server";

import { revalidatePath } from "next/cache";
import { getUserSession } from "./services";

export async function approveInternshipRecord(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const internshipId = formData.get("id");
    const status = formData.get("status");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/internship/${internshipId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({ status }),
      },
    );

    if (res.ok) {
      revalidatePath("/student/internship-record");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function createAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementData = Object.fromEntries(formData);

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/new?userId=${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(announcementData),
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Create Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function togglePinAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementId = formData.get("announcementId");
    const is_pinned = formData.get("is_pinned");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/pin/${announcementId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify({ is_pinned }),
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function updateAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementData = Object.fromEntries(formData);
    const announcementId = announcementData.id;

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcements/${announcementId}?userId=${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
        body: JSON.stringify(announcementData),
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");
    }

    return await res.json();
  } catch (err) {
    console.error("Pin Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteAnnouncement(prevState, formData) {
  try {
    const session = await getUserSession();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["department_head", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const announcementId = formData.get("announcementId");

    const res = await fetch(
      `${process.env.API_BASE_URL}/api/announcement/${announcementId}?userId=${userId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.BACKEND_SECRET_KEY,
        },
      },
    );

    if (res.ok) {
      revalidatePath("/announcements");

      revalidatePath("/notifications");
    }

    return await res.json();
  } catch (err) {
    console.error("Delete Announcement Error: ", err.message);
    return { success: false, error: err.message };
  }
}
