import Image from "next/image";
import { BriefcaseBusiness } from "lucide-react";
import logo from "@/public/logo.png";

function MainLoader() {
  return (
    <main
      role="status"
      aria-live="polite"
      className="flex min-h-screen min-h-[100svh] w-full flex-col items-center justify-center bg-background px-5 text-center text-foreground"
    >
      <div className="flex items-center justify-center" aria-hidden="true">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white p-1 ring-2 ring-primary/20 dark:ring-primary-emphasis/40">
          <Image src={logo} alt="" width={56} height={56} priority className="h-14 w-14 object-contain" />
        </div>

        <div className="relative mx-3 h-0.5 w-32 shrink-0 bg-primary/20 dark:bg-primary-emphasis/25">
          <span className="absolute -top-[3px] left-1/4 h-2 w-2 rounded-full bg-primary/30 dark:bg-primary-emphasis/40" />
          <span className="absolute -top-[3px] left-1/2 h-2 w-2 rounded-full bg-primary/30 dark:bg-primary-emphasis/40" />
          <span className="absolute -top-[3px] left-3/4 h-2 w-2 rounded-full bg-primary/30 dark:bg-primary-emphasis/40" />
          <span className="loader-connection-beam absolute -top-[3px] left-0 h-2 w-6 rounded-full bg-primary shadow-[0_0_14px_var(--primary)] dark:bg-primary-emphasis dark:shadow-[0_0_14px_var(--primary-emphasis)]" />
        </div>

        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary/25 text-primary-emphasis dark:border-primary-emphasis/40">
          <BriefcaseBusiness className="h-7 w-7" strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-9 text-[11px] font-bold uppercase tracking-[0.3em] text-primary-emphasis">EU-Connect</p>
      <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">Connecting your next step</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground-soft">
        Preparing your internship workspace at Manuel S. Enverga University Foundation &mdash; Candelaria Inc.
      </p>
      <p className="mt-6 text-xs font-medium text-foreground-subtle">Loading your workspace&hellip;</p>
    </main>
  );
}

export default MainLoader;
