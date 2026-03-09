"use server";

import { db } from "@/lib/db";
import { auth, signIn, signOut } from "./auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTodayDtr, getOngoingInternshipRecord } from "./services";
import { AuthError } from "next-auth";
import { toast } from "sonner";

////////////////////////////////////////////////////
// AUTHENTICATION
////////////////////////////////////////////////////
export async function login(prevState, formData) {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error; // Let Next.js handle other errors
  }
  // Redirect MUST happen outside the try-catch block
  redirect("/");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

////////////////////////////////////////////////////
//INTERNSHIP RECORDS
////////////////////////////////////////////////////
export async function createInternshipRecord(formData) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const data = Object.fromEntries(formData);

    // 1. Validation including Address Line 2
    const requiredFields = [
      "company_name",
      "address_line_1",
      "address_line_2", // Now strictly required
      "town_or_city",
      "state_or_province",
      "date_started",
      "total_hours",
    ];

    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === "") {
        throw new Error(`${field.replace(/_/g, " ")} is required for the map.`);
      }
    }

    // 2. Atomic Check & Insert
    const [result] = await db.execute(
      `
      INSERT INTO internship_records (user_id, company_name, address_line_1, address_line_2, town_or_city, state_or_province, date_started, total_hours)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM internship_records WHERE user_id = ? AND status = 'ongoing'
      )
      `,
      [
        userId,
        data.company_name,
        data.address_line_1,
        data.address_line_2,
        data.town_or_city,
        data.state_or_province,
        data.date_started,
        Number(data.total_hours),
        userId,
      ],
    );

    if (result.affectedRows === 0) {
      throw new Error("You already have an ongoing internship record.");
    }

    revalidatePath("/student");
    return { success: true, message: "Good luck in your internship!" };
  } catch (err) {
    console.error("Create Record Error: ", err.message);
    return { success: false, error: err.message };
  }
}

export async function finishInternshipRecord(internshipId, formData) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;
    if (!["student", "admin"].includes(session.user.role))
      throw new Error("Unauthorized role.");

    const internshipData = await getOngoingInternshipRecord();
    if (!internshipData) throw new Error("No ongoing internship to finish.");

    const [result] = await db.execute(
      `
      UPDATE internship_records
      SET status = CASE
        WHEN accumulated_hours >= total_hours THEN "finished"
        ELSE "ongoing"
      END
      WHERE user_id = ? AND id = ?
      `,
      [userId, internshipId],
    );

    if (result.affectedRows === 0) {
      throw new Error("Updating internship status failed.");
    }

    revalidatePath("/student");
    return {
      success: true,
      message: "Congrats on finishing your current internship!",
    };
  } catch (err) {
    console.error("Error: ", err.message);
    return { success: false, error: err.message };
  }
}

////////////////////////////////////////////////////
// DAILY TIME RECORDS
////////////////////////////////////////////////////
export async function getDtrs(page = 1) {
  const limit = 5;

  const validatedPage = Math.max(1, parseInt(page));
  const offset = (validatedPage - 1) * limit;

  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const user = session.user;

    const [rows] = await db.execute(
      `SELECT * FROM daily_time_records 
       WHERE user_id = ? AND internship_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?
       `,
      [user.id, internship.id, limit, offset],
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM daily_time_records
        WHERE user_id = ? AND internship_id = ?`,
      [user.id, internship.id],
    );

    const totalPages = Math.ceil(countResult[0].total / limit);

    return { dtrs: rows, totalPages };
  } catch (err) {
    return null;
  }
}

export async function clockIn() {
  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    // 1. Check if they have an internship
    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    // 2. Check if they already clocked in today
    const alreadyClockedIn = await getTodayDtr();
    if (alreadyClockedIn) throw new Error("You have already clocked in today.");

    // 3. Simple Insert
    await db.execute(
      `INSERT INTO daily_time_records (internship_id, user_id, clock_in) VALUES (?, ?, CURRENT_TIME())`,
      [internship.id, session.user.id],
    );

    revalidatePath("/student");
    return { success: true, message: "Clocked-in successfully!" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function clockOut() {
  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    // Use the optimized SQL UPDATE we discussed earlier
    // This handles the math and the link between tables in one go
    const [result] = await db.execute(
      `
      UPDATE daily_time_records AS dtr
      INNER JOIN internship_records AS ir ON dtr.internship_id = ir.id
      SET 
        dtr.clock_out = CURRENT_TIME(),
        dtr.total_hours = TIMESTAMPDIFF(MINUTE, dtr.clock_in, CURRENT_TIME()) / 60,
        ir.accumulated_hours = ir.accumulated_hours + (TIMESTAMPDIFF(MINUTE, dtr.clock_in, CURRENT_TIME()) / 60)
      WHERE dtr.user_id = ? 
        AND DATE(dtr.created_at) = CURDATE() 
        AND dtr.clock_out IS NULL
      `,
      [session.user.id],
    );

    if (result.affectedRows === 0) {
      throw new Error("No active clock-in found for today.");
    }

    revalidatePath("/student");
    return { success: true, message: "Clocked-out successfully!" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteDtr(prevState, formData) {
  // Added prevState for useActionState compatibility
  const connection = await db.getConnection();

  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const user = session.user;

    // Safety check: ensure formData exists before calling .get()
    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const dtrId = Number(formData.get("dtrId"));
    if (!dtrId) throw new Error("Record ID is missing.");

    await connection.beginTransaction();

    // 1. Subtract hours from the internship record first
    // COALESCE ensures we subtract 0 if they haven't clocked out yet
    await connection.execute(
      `
      UPDATE internship_records ir
      INNER JOIN daily_time_records dtr ON ir.id = dtr.internship_id
      SET ir.accumulated_hours = ir.accumulated_hours - COALESCE(dtr.total_hours, 0)
      WHERE dtr.id = ? AND dtr.user_id = ?
      `,
      [dtrId, user.id],
    );

    // 2. Delete the record
    const [result] = await connection.execute(
      `DELETE FROM daily_time_records WHERE id = ? AND user_id = ?`,
      [dtrId, user.id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Delete failed. Record not found.");
    }

    await connection.commit();

    revalidatePath("/student");
    return { success: true, message: "Record deleted." };
  } catch (err) {
    await connection.rollback();
    console.error("Delete Error:", err.message);
    return { success: false, error: err.message };
  } finally {
    connection.release(); // Return connection to pool
  }
}

////////////////////////////////////////////////////
// DAILY NARRATIVES
////////////////////////////////////////////////////
export async function getDailyNarratives(page = 1) {
  const limit = 2;

  const validatedPage = Math.max(1, parseInt(page));
  const offset = (validatedPage - 1) * limit;

  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const internship = await getOngoingInternshipRecord();
    if (!internship) return null;

    const user = session.user;

    const [rows] = await db.execute(
      `SELECT * FROM daily_narratives 
       WHERE user_id = ? AND internship_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?
       `,
      [user.id, internship.id, limit, offset],
    );

    const [countResult] = await db.execute(
      `SELECT COUNT(*) AS total FROM daily_narratives
        WHERE user_id = ? AND internship_id = ?`,
      [user.id, internship.id],
    );

    const totalPages = Math.ceil(countResult[0].total / limit);

    return { narratives: rows, totalPages };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function createNarrative(prevState, formData) {
  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    const data = Object.fromEntries(formData);

    const requiredFields = ["day_number", "title", "narrative"];

    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === "") {
        throw new Error(`${field.replace(/_/g, " ")} is required.`);
      }
    }

    const { day_number, title, narrative } = data;

    if (!title.trim()) throw new Error("Title is required.");

    // 1. Check if they have an internship
    const internship = await getOngoingInternshipRecord();
    if (!internship) throw new Error("No ongoing internship found.");

    // 3. Simple Insert
    const [result] = await db.execute(
      `INSERT INTO daily_narratives (user_id, internship_id, day_number, title, narrative)
        VALUES (?, ?, ?, ?, ?)`,
      [
        session.user.id,
        internship.id,
        Number(day_number),
        title,
        narrative.trim(),
      ],
    );

    if (result.affectedRows === 0 && !result.insertId)
      throw new Error("Posting daily narrative failed.");

    revalidatePath("/student");
    return { success: true, message: "Narrative added!" };
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function editNarrative(narrativeId, formData) {
  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }

    if (!narrativeId) throw new Error("Narrative doesn'nt exist.");

    const data = Object.fromEntries(formData);

    const { day_number, title, narrative } = data;

    if (!title.trim()) throw new Error("Title is required.");

    const [result] = await db.execute(
      `
      UPDATE daily_narratives
      SET
        day_number = COALESCE(?, day_number),
        title = COALESCE(?, title),
        narrative = COALESCE(?, narrative)
      WHERE id = ? AND user_id = ?
      `,
      [
        Number(day_number),
        title,
        narrative.trim(),
        narrativeId,
        session.user.id,
      ],
    );

    if (result.affectedRows === 0) {
      throw new Error("Update failed.");
    }

    revalidatePath("/student");
    return { success: true, message: "Narrative updated!" };
  } catch (err) {
    console.log(err);
    return { success: false, error: err.message };
  }
}

export async function deleteNarrative(prevState, formData) {
  // Added prevState for useActionState compatibility
  const connection = await db.getConnection();

  try {
    const session = await auth();
    if (!session?.user || !["student", "admin"].includes(session.user.role)) {
      throw new Error("Unauthorized");
    }
    const user = session.user;

    // Safety check: ensure formData exists before calling .get()
    if (!formData || typeof formData.get !== "function") {
      throw new Error("Invalid form submission.");
    }

    const narrativeId = Number(formData.get("narrativeId"));
    if (!narrativeId) throw new Error("Record ID is missing.");

    await connection.beginTransaction();

    // 2. Delete the record
    const [result] = await connection.execute(
      `DELETE FROM daily_narratives WHERE id = ? AND user_id = ?`,
      [narrativeId, user.id],
    );

    if (result.affectedRows === 0) {
      throw new Error("Delete failed. Record not found.");
    }

    await connection.commit();

    revalidatePath("/student");
    return { success: true, message: "Record deleted." };
  } catch (err) {
    await connection.rollback();
    console.error("Delete Error:", err.message);
    return { success: false, error: err.message };
  } finally {
    connection.release();
  }
}
