import Link from "next/link";
import { SearchX, Home, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 sm:p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 ring-8 ring-primary-50/50">
          <SearchX className="h-7 w-7 text-primary-emphasis" />
        </div>

        <p className="mt-5 text-5xl font-bold text-foreground-faint">404</p>
        <h1 className="mt-2 text-lg font-semibold text-foreground">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
