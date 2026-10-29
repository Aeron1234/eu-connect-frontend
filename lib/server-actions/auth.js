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

// Cookie persistence is best-effort: Server Component renders cannot write
// cookies, while Server Actions and Route Handlers can. The page proxy is
// another cookie-writing boundary; a refreshed return value here does not
// guarantee that this call updated the browser's cookies.
async function trySetAuthCookies(tokens) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(ACCESS_COOKIE, tokens.accessToken, accessCookieOptions);
    cookieStore.set(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
  } catch {
    // Suppress cookie-setting errors, including writes attempted during a read-only render.
  }
}

async function tryClearAuthCookies() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ACCESS_COOKIE);
    cookieStore.delete(REFRESH_COOKIE);
  } catch {
    // Cookie deletion is also best-effort; deletion errors are not surfaced here.
  }
}

// ---- public API -------------------------------------------------------------

// Memoize repeated session reads in React's server-request cache. Verify the
// access cookie first; otherwise ask the backend to rotate the refresh token
// and verify the returned access token before exposing its claims. Missing
// credentials or an unavailable/rejected refresh return null.
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

  if (payload.purpose === "password_setup") return null;
  return { user: payloadToUser(payload) };
});

// Provide a bearer token for server-to-server API calls. Reuse a locally
// verified access cookie or return the backend's refreshed access token.
// Cookie writes remain best-effort; a missing/failed refresh returns null.
export async function getAccessToken() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  const verified = verifyAccessToken(accessToken);
  if (verified) {
    if (verified.purpose === "password_setup") return null;
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

  // The API call ran on the server, so Next.js must set the browser's session
  // cookies itself. A temporary credential sends the user to password setup.
  const cookieStore = await cookies();
  const isProd = process.env.NODE_ENV === "production";

  cookieStore.set("access_token", tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  if (tokens.refreshToken) {
    cookieStore.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  } else cookieStore.delete("refresh_token");

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
        // Relay the refresh cookie explicitly because this server-to-server call
        // has no browser cookie jar. Local cookies are cleared below even if the
        // backend request fails.
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
        signal: AbortSignal.timeout(30_000),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );

    // Display the backend's generic recovery message without inferring whether
    // the email belongs to an account.
    const data = await res.json();
    if (!res.ok) return { error: data.error || "Could not request a password setup email." };
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

  const token = formData.get("token");
  const invitation = typeof token === "string" && token.length > 0;
  if (invitation && !/^[a-f0-9]{64}$/.test(token)) return { error: "This setup link is invalid. Request a new email." };
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  const setupSession = verifyAccessToken(accessToken);
  if (!invitation && setupSession?.purpose !== "password_setup") redirect("/login?signin=1");
  if (!invitation && !accessToken) {
    redirect("/login?signin=1");
  }

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/auth/${invitation ? "account-setup" : "set-password"}`,
      {
        method: invitation ? "POST" : "PATCH",
        signal: AbortSignal.timeout(20_000),
        headers: {
          "Content-Type": "application/json",
          ...(!invitation ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ newPassword, confirmPassword, ...(invitation ? { token } : {}) }),
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || "Something went wrong." };
    }

    // After the backend saves the password and revokes stored refresh sessions,
    // discard this browser's token pair and return to sign-in.
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/login?signin=1");
}
