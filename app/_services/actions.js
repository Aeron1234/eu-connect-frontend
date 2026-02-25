"use server";

import { db } from "@/lib/db";
import { auth, signIn, signOut } from "./auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

    const session = await auth();
    if (!session?.user) throw new Error("You must be logged in");

    const userId = session.user.id;

    //Checking roles
    const roles = ["student", "admin"];
    const role = session.user.role;
    if (!roles.includes(role))
      throw new Error("You are not allowed to create an internship record!");

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

    console.log(result);

    const [rows] = await db.execute(
      `
      SELECT * FROM internship_records
      WHERE id = ?
      `,
      [result.insertId],
    );

    if (rows.length === 0)
      throw new Error("Failed to create internship record");

    return { success: true, data: rows[0] };
  } catch (err) {
    console.log("Error: ", err.message);
  }

  revalidatePath("/student");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
