"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ShieldAlert,
  ServerCrash,
  WifiOff,
  RefreshCw,
  Home,
} from "lucide-react";

// Maps a caught error to a display config. Customize the `match` functions
// to match how your API/actions actually surface status codes — right now
// this checks error.message and an optional error.status/error.digest,
// since Next.js error boundaries only receive a native Error object.
function classifyError(error) {
  const status = error?.status || error?.cause?.status;
  const message = (error?.message || "").toLowerCase();

  if (
    status === 403 ||
    message.includes("forbidden") ||
    message.includes("not authorized")
  ) {
    return {
      icon: ShieldAlert,
      title: "Access Denied",
      description:
        "You don't have permission to view this page or perform this action.",
      tone: "amber",
    };
  }

  if (
    status === 401 ||
    message.includes("unauthorized") ||
    message.includes("not authenticated")
  ) {
    return {
      icon: ShieldAlert,
      title: "Session Expired",
      description: "Please log in again to continue.",
      tone: "amber",
      showLogin: true,
    };
  }

  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return {
      icon: RefreshCw,
      title: "Slow Down",
      description:
        "You've made too many requests. Please wait a moment and try again.",
      tone: "blue",
    };
  }

  if (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("failed to fetch")
  ) {
    return {
      icon: WifiOff,
      title: "Connection Problem",
      description:
        "We couldn't reach the server. Check your internet connection and try again.",
      tone: "stone",
    };
  }

  if (
    status >= 500 ||
    message.includes("database") ||
    message.includes("internal server")
  ) {
    return {
      icon: ServerCrash,
      title: "Server Error",
      description:
        "Something went wrong on our end. Our team has been notified.",
      tone: "red",
    };
  }

  return {
    icon: AlertTriangle,
    title: "Something Went Wrong",
    description: "An unexpected error occurred. Please try again.",
    tone: "red",
  };
}

const toneStyles = {
  red: { bg: "bg-red-50", text: "text-red-600", ring: "ring-red-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-100" },
  stone: { bg: "bg-stone-100", text: "text-stone-500", ring: "ring-stone-200" },
};

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("Route error boundary caught:", error);
  }, [error]);

  const {
    icon: Icon,
    title,
    description,
    tone,
    showLogin,
  } = classifyError(error);
  const styles = toneStyles[tone] || toneStyles.red;

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-xl border border-stone-300 bg-white p-6 sm:p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${styles.bg} ring-8 ${styles.ring}`}
        >
          <Icon className={`h-7 w-7 ${styles.text}`} />
        </div>

        <h1 className="mt-5 text-lg font-semibold text-stone-800">{title}</h1>
        <p className="mt-2 text-sm text-stone-500">{description}</p>

        {process.env.NODE_ENV === "development" && error?.message && (
          <pre className="mt-4 max-h-32 overflow-auto rounded-md bg-stone-100 p-3 text-left text-[11px] text-stone-600">
            {error.message}
          </pre>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href={showLogin ? "/login" : "/"}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-stone-300 px-4 py-2.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-100"
          >
            <Home className="h-4 w-4" />
            {showLogin ? "Log In" : "Go Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
