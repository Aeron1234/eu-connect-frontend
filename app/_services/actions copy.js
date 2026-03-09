"use server";

import { db } from "@/lib/db";
import { auth, signIn, signOut } from "./auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  calculateShiftHours,
  getDtrs,
  getOngoingInternshipRecord,
} from "./services";
import { format } from "date-fns";

export async function login(prevState, formData) {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirect: false,
    });

    redirect(`/`);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }

    throw error;
  }
}

export async function createInternshipRecord(formData) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    //Checking roles
    const role = session.user.role;
    if (!["student", "admin"].includes(role))
      throw new Error("You are not allowed to create an internship record!");

    const {
      company_name,
      address_line_1,
      address_line_2,
      town_or_city,
      state_or_province,
      date_started,
      total_hours,
    } = { ...Object.fromEntries(formData) };

    if (
      !company_name ||
      !address_line_1 ||
      !address_line_2 ||
      !town_or_city ||
      !state_or_province ||
      !date_started ||
      !total_hours
    )
      throw new Error("All fields are required");

    const internshipData = await getOngoingInternshipRecord();

    if (internshipData?.status === "ongoing")
      throw new Error(
        "Finish your ongoing internship before creating new one.",
      );

    const [result] = await db.execute(
      `
      INSERT INTO internship_records (user_id, company_name, address_line_1, address_line_2, town_or_city, state_or_province, date_started, 
      total_hours)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        company_name,
        address_line_1,
        address_line_2,
        town_or_city,
        state_or_province,
        date_started,
        Number(total_hours),
      ],
    );

    const [rows] = await db.execute(
      `
      SELECT * FROM internship_records
      WHERE id = ?
      `,
      [result.insertId],
    );

    if (rows.length === 0)
      throw new Error("Failed to create internship record");

    const { status } = await getOngoingInternshipRecord();
    if (status === "ongoing")
      throw new Error(
        "Please finish your ongoing internship before creating new one",
      );

    revalidatePath("/student");
    return { success: true, message: "Good luck in your internship!" };
  } catch (err) {
    console.log("Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function clockIn() {
  try {
    const session = await auth();

    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    const role = session.user.role;
    if (!["student"].includes(role))
      throw new Error("You are not allowed to create an daily time record!");

    // CHECKING IF THERE'S AN ONGOING INTERNSHIP
    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData?.id)
      throw new Error("You must create an internship record first");
    const internshipId = internshipData.id;

    const currentTime = format(new Date(), "HH:mm:ss");
    const [result] = await db.execute(
      `
        INSERT INTO daily_time_records (internship_id, user_id, clock_in)
        VALUES (?, ?, ?)
      `,
      [internshipId, userId, currentTime],
    );

    const [rows] = await db.execute(
      `
      SELECT * FROM daily_time_records
      WHERE id = ?
      `,
      [result.insertId],
    );

    if (rows.length === 0) throw new Error("Clock-in failed");

    revalidatePath("/student");
    return { success: true, message: "Clocked-in successfully!" };
  } catch (err) {
    console.log("Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function clockOut() {
  try {
    const session = await auth();

    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    const role = session.user.role;
    if (!["student"].includes(role))
      throw new Error("You are not allowed to create an daily time record!");

    // CHECKING IF THERE'S AN ONGOING INTERNSHIP
    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData)
      throw new Error("You must create an internship record first");

    const dtrData = await getDtrs();

    // CHECK if there's an existing data
    if (!dtrData) throw new Error("Not allowed to clock-out");

    const currentDate = format(new Date(), "MM/dd/yyyy");
    const currentTime = format(new Date(), "HH:mm:ss");

    //Finding today's record
    const dtrRecordToday = dtrData.find(
      (data) =>
        format(new Date(data.created_at), "MM/dd/yyyy") === currentDate &&
        data.user_id === userId,
    );

    //Calculate how many hours of shift
    const totalHours = calculateShiftHours(
      dtrRecordToday.clock_in,
      currentTime,
    );

    const accumulatedHours = totalHours + internshipData.accumulated_hours;

    const [result] = await db.execute(
      `
      UPDATE daily_time_records AS dtr
      INNER JOIN internship_records AS ir ON dtr.internship_id = ir.id
      SET dtr.clock_out = ?, dtr.total_hours = ?, ir.accumulated_hours = ?
      WHERE dtr.id = ?
      `,
      [currentTime, totalHours, accumulatedHours, dtrRecordToday.id],
    );

    //If there's no affected row, then the update didn't happen
    if (result.affectedRows < 0)
      throw new Error("Updating daily time record failed.");

    revalidatePath("/student");
    return { success: true, message: "Clocked-out successfully!" };
  } catch (err) {
    console.log("Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteDtr(formData) {
  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const dtrId = Number(formData.get("dtrId"));
    console.log(dtrId);

    const [result] = await db.execute(
      `
      DELETE FROM daily_time_records AS dtr
      INNER JOIN internship_records AS ir ON dtr.internship_id = ir.id
      WHERE id = ? AND user_id = ?
      `,
      [dtrId, session.user.id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Deleting failed. Please try again.");
    }

    revalidatePath("/student");
    return {
      success: true,
      message: "Daily time record was deleted successfully!",
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
