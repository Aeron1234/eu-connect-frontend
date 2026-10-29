import Link from "next/link";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

// Keep branding and column sizes in place while the token-bearing page loads.
// Authentication and token validation remain in the existing actions/backend.
export default function PasswordSetupShell({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-foreground">
      <header className="shrink-0 border-b border-border bg-card">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
          <Link href="/login" className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" aria-label="EU-Connect home">
            <Logo small />
            <span className="min-w-0">
              <span className="block text-base font-bold tracking-tight">EU-Connect</span>
              <span className="block text-[11px] text-foreground-soft sm:text-xs">MSEUF-CI Internship Management</span>
            </span>
          </Link>
          <ThemeToggle className="shrink-0" />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
        <div className="grid w-full max-w-5xl min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[0.85fr_1fr]">
          <aside className="brand-orbit hidden flex-col justify-between gap-16 bg-primary p-9 text-primary-foreground lg:flex xl:p-11">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
                <ShieldCheck className="size-4" aria-hidden="true" /> Secure school access
              </span>
              <h2 className="mt-9 text-4xl font-bold leading-tight tracking-tight">Your OJT journey,<br />connected.</h2>
              <p className="mt-5 max-w-xs text-sm leading-7 text-white/80">One place for your internship records, progress, and school community.</p>
            </div>
            <div>
              <KeyRound className="mb-4 size-7 text-white/80" aria-hidden="true" />
              <p className="text-sm font-semibold">A password of your own.</p>
              <p className="mt-2 text-sm leading-7 text-white/75">Choose your password here, then sign in to your EU-Connect workspace.</p>
              <p className="mt-8 border-t border-white/20 pt-5 text-xs leading-6 text-white/65">Manuel S. Enverga University Foundation<br />Candelaria, Inc.</p>
            </div>
          </aside>
          <section aria-labelledby="password-setup-title" className="min-w-0 px-5 py-7 sm:p-9 lg:p-10 xl:p-12">
            {children}
          </section>
        </div>
      </main>
      <footer className="px-4 pb-5 text-center text-xs leading-5 text-foreground-subtle">
        For account assistance, contact your department head or system administrator.
      </footer>
    </div>
  );
}

export function PasswordSetupBackLink() {
  return <Link href="/login?signin=1" className="inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-medium text-foreground-soft underline-offset-4 hover:text-primary-emphasis hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
    <ArrowLeft className="size-4" aria-hidden="true" /> Back to sign in
  </Link>;
}
