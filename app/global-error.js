"use client";

import { useEffect } from "react";
import { ServerCrash, RefreshCw } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-muted">
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-100">
              <ServerCrash className="h-7 w-7 text-red-600" />
            </div>
            <h1 className="mt-5 text-lg font-semibold text-foreground">
              Application Error
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Something went badly wrong. Please refresh the page.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
