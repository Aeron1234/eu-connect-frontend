"use server";

import { getApiBaseUrl } from "../api-base-url.mjs";

import { cookies } from "next/headers";
import { cache } from "react";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
  verifyAccessToken,
  refreshTokens,
  payloadToUser,
} from "./auth-shared";
import { redirect } from "next/navigation";

// ---- cookie helpers --------------------------------------------------------

// Cookies can only be mutated in a Server Action or Route Handler — NOT in
// a Server Component render. getUserSession() gets called from both, so
// every write here is wrapped in try/catch and fails silently when called
// from a read-only render context. That's fine: in that case, proxy.js
// already refreshed and set fresh cookies before this request ever reached
// the component, so there's nothing this call would have needed to persist.
async function trySetAuthCookies(tokens) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions);
    cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
  } catch {
    // Read-only context (Server Component render) — safe to ignore.
  }
}

async function tryClearAuthCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
  } catch {
    // Read-only context — safe to ignore.
  }
}

// ---- public API -------------------------------------------------------------

// Matches the shape NextAuth's session.user used to have, so most existing
// call sites (session.user.id, session.user.role, etc.) don't need changes.
// Self-healing: if the access token is expired but the refresh token is
// still valid, this transparently refreshes and persists new cookies
// (when called somewhere cookies can be written) before returning the user.
export const getUserSession = cache(async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  let payload = verifyAccessToken(accessToken);

  if (!payload) {
    const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
    if (!refreshToken) return null;

    const newTokens = await refreshTokens(refreshToken);
    if (!newTokens) {
      await tryClearAuthCookies();
      return null;
    }

    payload = verifyAccessToken(newTokens.accessToken);
    if (!payload) return null; // shouldn't happen, but don't trust a bad token

    await trySetAuthCookies(newTokens);
  }

  return { user: payloadToUser(payload) };
});

// Server actions and route handlers calling the Express API need the raw
// token string to send as an Authorization header. Self-healing like
// getUserSession() — refreshes and persists new cookies if the current
// access token is dead, so callers always get back a token that's
// actually valid to use right now (or null if the whole session is gone).
export async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (verifyAccessToken(accessToken)) {
    return accessToken;
  }

  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  const newTokens = await refreshTokens(refreshToken);
  if (!newTokens) {
    await tryClearAuthCookies();
    return null;
  }

  await trySetAuthCookies(newTokens);
  return newTokens.accessToken;
}

export async function login(formData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || typeof username !== "string") {
    return { error: "Username is required." };
  }

  const usernameRegex = /^\S+$/;
  if (!usernameRegex.test(username)) {
    return { error: "Invalid username format." };
  }

  let tokens;
  let mustChangePassword = false;

  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error === "inactive_account") {
        return {
          error: "This account has been deactivated. Please contact the Admin.",
        };
      }
      if (data.error === "account_locked") {
        return { error: data.message };
      }
      return { error: data.error || "Invalid username or password." };
    }

    tokens = { accessToken: data.accessToken, refreshToken: data.refreshToken };
    mustChangePassword = !!data.mustChangePassword;
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong during sign in." };
  }

  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("access_token", tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  cookieStore.set("refresh_token", tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  redirect(mustChangePassword ? "/set-password" : "/");
}

export async function logout() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  try {
    await fetch(`${getApiBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Manually relaying the refresh token as a Cookie header — this is
        // a server-to-server call, so there's no browser-managed cookie
        // jar to rely on here. cookie-parser on the Express side parses
        // this exactly the same as a real browser-sent cookie.
        ...(refreshToken ? { Cookie: `refresh_token=${refreshToken}` } : {}),
      },
    });
  } catch (error) {
    console.error(error);
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function forgotPassword(formData) {
  const email = formData.get("email");

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/auth/forgot-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    // The backend always returns a generic message regardless of outcome —
    // don't add any branching here that could leak whether the email exists.
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function setPassword(formData) {
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    redirect("/login?signin=1");
  }

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/auth/set-password`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Something went wrong." };
    }

    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/login?signin=1");
}
