import { db } from "@/lib/db";
import { auth } from "./auth";
import { cache } from "react";

export const getOngoingInternshipRecord = cache(async () => {
  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const user = session.user;

    const [rows] = await db.execute(
      `SELECT * FROM internship_records
       WHERE user_id = ? AND status = "ongoing"
       LIMIT 1`,
      [user.id],
    );

    return rows[0] || null;
  } catch (err) {
    return null;
  }
});

export const getStudentUserProfile = cache(async () => {
  try {
    const session = await auth();
    const user = session.user;

    const [rows] = await db.execute(
      `SELECT * FROM student_profiles
       WHERE user_id = ?
       LIMIT 1`,
      [user.id],
    );

    return rows[0] || null;
  } catch (err) {
    return null;
  }
});

// NEW: Optimized for checking status without downloading the whole history
export async function getTodayDtr() {
  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const user = session.user;

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship found.");

    const [rows] = await db.execute(
      `SELECT * FROM daily_time_records 
       WHERE user_id = ? AND DATE(created_at) = CURDATE() AND internship_id = ?
       LIMIT 1`,
      [user.id, internshipData.id],
    );
    return rows[0] || null;
  } catch (err) {
    return null;
  }
}

export async function checkDtrStatus() {
  // Use the new optimized query instead of fetching all DTRs
  const dtrRecordToday = await getTodayDtr();

  if (!dtrRecordToday) return { status: "clocked-out" };

  if (dtrRecordToday.clock_in && !dtrRecordToday.clock_out) {
    return { status: "clocked-in" };
  }

  return { status: "clocked-out" };
}

// Keep this for the History Table, but add a LIMIT or Sort
