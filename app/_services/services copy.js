import { db } from "@/lib/db";
import { auth } from "./auth";
import { differenceInMinutes, format, parse } from "date-fns";

export async function getOngoingInternshipRecord() {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("You must be logged in");

    if (session.user.role !== "student") throw new Error("Not allowed");

    const userId = session.user.id;

    const [rows] = await db.execute(
      `
      SELECT * FROM internship_records
      WHERE user_id = ? AND status = "ongoing"
      `,
      [userId],
    );

    const data = rows[0];

    if (rows.length === 0) throw new Error("You don't have ongoing internship");

    return data;
  } catch (err) {
    console.log("Error: ", err.message);
    return null;
  }
}

export async function getDtrs() {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("You must be logged in");

    const role = session.user.role;
    if (!["student"].includes(role)) throw new Error("Not allowed");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData?.id) throw new Error("No ongoing internship");
    const internshipId = internshipData.id;

    const userId = session.user.id;

    const [rows] = await db.execute(
      `
      SELECT * FROM daily_time_records
      WHERE user_id = ? AND internship_id = ?
      `,
      [userId, internshipId],
    );

    if (rows.length === 0) throw new Error("No daily time records found");

    return rows;
  } catch (err) {
    console.log("Error: ", err.message);
    return null;
  }
}

// FOR CHECKING STATUS
export async function checkDtrStatus() {
  const session = await auth();
  if (!session?.user) throw new Error("You must be logged in");
  const userId = session.user.id;

  const role = session.user.role;
  if (!["student"].includes(role)) throw new Error("Not allowed");

  const dtrData = await getDtrs();

  // CHECK if there's an existing data
  if (!dtrData) return { status: "clocked-out" };

  const currentDate = format(new Date(), "MM/dd/yyyy");

  //STEP 1
  //Finding today's record
  const dtrRecordToday = dtrData.find(
    (data) =>
      format(new Date(data.created_at), "MM/dd/yyyy") === currentDate &&
      data.user_id === userId,
  );

  //STEP 2
  //checking if no existing record today, that means the user status is clocked-out.
  // The user haven't clocked-in today yet.
  if (!dtrRecordToday) return { status: "clocked-out" };

  //STEP 3
  //Checking if the clock_in has an existing value and clock_out doesn't.
  //If there's value in clock_in, then that means the user is clocked-in.
  if (dtrRecordToday.clock_in && !dtrRecordToday.clock_out)
    return { status: "clocked-in" };

  //STEP 4
  //It is clocked-out because the user has already completed their attendace today
  return { status: "clocked-out" };
}

export function calculateShiftHours(clockInStr, clockOutStr) {
  // 1. Create a reference date (today) to anchor the times
  const today = new Date();

  // 2. Parse the MySQL strings into real Date objects
  const start = parse(clockInStr, "HH:mm:ss", today);
  const end = parse(clockOutStr, "HH:mm:ss", today);

  // 3. Get the difference in minutes
  const totalMinutes = differenceInMinutes(end, start);

  // 4. Return as decimal hours (e.g., 9.5)
  return Number((totalMinutes / 60).toFixed(2));
}
