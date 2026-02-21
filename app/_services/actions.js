"use server";

import { auth, signIn, signOut } from "./auth";
import { AuthError } from "next-auth";
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

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
