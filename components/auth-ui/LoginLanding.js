"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ArrowDownRight, ArrowRight, BookOpenText, BriefcaseBusiness, CalendarDays, Check,
  ClipboardCheck, Clock3, FileCheck2, FileText, FolderOpen, GraduationCap,
  ShieldCheck, UserRoundCheck, UsersRound,
} from "lucide-react";
import logo from "@/public/logo.png";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LoginForm from "@/components/auth-ui/LoginForm";
import PhilippinesNetwork from "@/components/auth-ui/PhilippinesNetwork";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { modalFormContentClass } from "@/components/ui/modalFormStyles";

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "For everyone", href: "#for-everyone" },
];

const steps = [
  { Icon: BriefcaseBusiness, title: "Find your place", detail: "Explore internship opportunities and begin your internship record." },
  { Icon: FolderOpen, title: "Prepare together", detail: "Keep requirements, announcements, and placement details in reach." },
  { Icon: Clock3, title: "Show your work", detail: "Track duty time and share weekly narratives as your internship progresses." },
  { Icon: FileCheck2, title: "Finish with clarity", detail: "Review evaluations, completed hours, and your internship history." },
];

const features = [
  { Icon: Clock3, title: "Daily Time Records (DTR)", detail: "Clock in and out at your approved location, record breaks, and track daily attendance and total rendered hours." },
  { Icon: BriefcaseBusiness, title: "Internship records", detail: "Submit your placement, update pending details, and follow its approval status through to completion." },
  { Icon: BookOpenText, title: "Weekly narratives", detail: "Record what you accomplished and learned each week in one organized history." },
  { Icon: FileText, title: "Summary reports", detail: "Write your internship summary, attach supporting images, and download a PDF copy of your report." },
  { Icon: FolderOpen, title: "Documents and requirements", detail: "Upload requirements, review documents shared by your supervisor, and keep accepted files organized." },
  { Icon: BriefcaseBusiness, title: "Internship opportunities", detail: "Browse postings, save favorites, and explore potential placements." },
  { Icon: UserRoundCheck, title: "Supervisor connections", detail: "Find your company supervisor, send a supervision request, and connect once your request is accepted." },
  { Icon: ClipboardCheck, title: "Evaluations and feedback", detail: "Complete internship evaluations and review feedback shared by students and company supervisors." },
  { Icon: CalendarDays, title: "Announcements and calendar", detail: "Follow school updates, department schedules, and important internship dates in one shared workspace." },
];

const roles = [
  { Icon: GraduationCap, title: "Students", detail: "A clear home for your records, requirements, weekly work, and evaluations.", items: ["Track duty hours", "Submit weekly narratives", "See your progress"] },
  { Icon: BriefcaseBusiness, title: "Company supervisors", detail: "Support interns through placements, document review, and evaluations.", items: ["Manage opportunities", "Work with interns", "Share feedback"] },
  { Icon: UsersRound, title: "Department heads", detail: "Stay close to student progress across placements and academic work.", items: ["Monitor internships", "Review submissions", "See department insights"] },
  { Icon: ShieldCheck, title: "Administrators", detail: "Keep accounts, academic choices, and system activity organized.", items: ["Manage accounts", "Maintain criteria", "Review activity"] },
];

export default function LoginLanding({ initialSignInOpen = false }) {
  const [signInOpen, setSignInOpen] = useState(initialSignInOpen);

  return (
    <Dialog open={signInOpen} onOpenChange={setSignInOpen}>
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-18 sm:gap-4 sm:px-8 lg:px-12">
          <a href="#top" className="flex shrink-0 items-center gap-2 max-[359px]:gap-1.5 sm:gap-3" aria-label="EU-Connect home">
            <Image src={logo} alt="Manuel S. Enverga University Foundation - Candelaria Incorporated seal" width={42} height={42} className="size-8 object-contain max-[359px]:size-7 sm:size-10" priority />
            <span className="text-base font-bold tracking-tight text-primary-emphasis max-[359px]:text-sm sm:text-lg">EU-Connect</span>
          </a>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Landing page">
            {navLinks.map(({ label, href }) => (
              <a key={href} href={href} className="text-sm font-medium text-foreground-soft transition-colors hover:text-primary-emphasis focus-visible:text-primary-emphasis">{label}</a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle className="max-[359px]:size-9" />
            <DialogTrigger asChild><button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring max-[359px]:gap-0 max-[359px]:px-2.5 sm:px-5">
              Log in <ArrowRight className="size-4 max-[359px]:hidden" aria-hidden="true" />
            </button></DialogTrigger>
          </div>
        </div>
      </header>

      <main id="top" className="scroll-mt-16 sm:scroll-mt-18">
        <section className="landing-hero relative isolate overflow-hidden bg-primary text-primary-foreground">
          <div className="landing-hero-grid pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-28 top-8 size-80 rounded-full border border-white/15" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-48 -top-48 size-130 rounded-full border border-white/15" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:gap-14 sm:px-8 sm:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20 lg:px-12 lg:py-12">
            <div className="max-w-2xl">
              <p className="landing-enter inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
                <span className="size-1.5 rounded-full bg-[#b5cf50]" aria-hidden="true" />
                Exclusively for MSEUF-CI · OJT
              </p>
              <h1 className="landing-enter landing-delay-1 mt-5 max-w-3xl text-[clamp(2rem,9vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.045em] sm:mt-8 sm:text-[clamp(2.5rem,6vw,5.5rem)] sm:leading-[1.03] sm:tracking-[-0.055em]">
                Your OJT journey, <span className="text-[#efefef]">connected.</span>
              </h1>
              <p className="landing-enter landing-delay-2 mt-4 max-w-xl text-[13px] leading-6 text-primary-foreground/80 sm:mt-7 sm:text-lg sm:leading-8">
                Exclusively for Manuel S. Enverga University Foundation - Candelaria Incorporated. A shared OJT workspace for our students, department heads, and partner companies.
              </p>
              <div className="landing-enter landing-delay-3 mt-5 flex flex-col gap-2.5 sm:mt-9 sm:flex-row sm:items-center sm:gap-3">
                <button type="button" onClick={() => setSignInOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#efefef] px-5 text-[13px] font-bold text-[#710000] transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6 sm:text-sm">
                  Open your dashboard <ArrowRight className="size-4" aria-hidden="true" />
                </button>
                <a href="#how-it-works" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/35 px-5 text-[13px] font-semibold transition hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6 sm:text-sm">
                  See how it works <ArrowDownRight className="size-4" aria-hidden="true" />
                </a>
              </div>
              <p className="landing-enter landing-delay-4 mt-5 flex items-center gap-2 text-xs leading-5 text-primary-foreground/70 sm:mt-8 sm:text-sm">
                <Check className="size-4 shrink-0" aria-hidden="true" /> One workspace for every part of the internship.
              </p>
            </div>

            <div className="landing-enter landing-delay-2 relative mx-auto w-full min-w-0 max-w-xl">
              <PhilippinesNetwork />
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card" aria-label="Who EU-Connect connects">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:gap-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <p className="text-xs font-semibold text-foreground-soft sm:text-sm">One workspace for our OJT community</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-foreground sm:gap-x-7 sm:gap-y-3 sm:text-sm">
              {["Students", "Company supervisors", "Department heads", "Administrators"].map((roleName) => (
                <span key={roleName} className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />{roleName}</span>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-16 bg-background py-12 sm:scroll-mt-18 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div><p className="landing-eyebrow">A simpler path through OJT</p><h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-5xl">Progress you can actually follow.</h2></div>
              <p className="max-w-xl text-sm leading-6 text-foreground-soft sm:text-base sm:leading-8 lg:justify-self-end">Internship work moves through many hands. EU-Connect brings the essential steps together, so everyone knows what comes next.</p>
            </div>
            <div className="mt-7 grid gap-3 sm:mt-12 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map(({ Icon, title, detail }, index) => (
                <article key={title} className="landing-step relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                  <span className="absolute right-5 top-3 text-6xl font-bold tracking-tighter text-primary/8 dark:text-primary-emphasis/50" aria-hidden="true">0{index + 1}</span>
                  <span className="relative flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12"><Icon className="size-4 sm:size-5" aria-hidden="true" /></span>
                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary-emphasis sm:mt-8 sm:text-xs sm:tracking-[0.18em]">Step 0{index + 1}</p>
                  <h3 className="mt-1.5 text-lg font-bold sm:mt-2 sm:text-xl">{title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-foreground-soft sm:mt-3 sm:text-sm sm:leading-6">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-16 bg-canvas py-12 sm:scroll-mt-18 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="max-w-2xl"><p className="landing-eyebrow">The essentials, together</p><h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-5xl">Built around the work that matters.</h2><p className="mt-4 text-sm leading-6 text-foreground-soft sm:mt-5 sm:text-base sm:leading-8">Manage each part of your internship, from daily time records and placement approval to reports, requirements, and feedback.</p></div>
            <div className="mt-7 grid gap-3 sm:mt-11 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
              {features.map(({ Icon, title, detail }) => (
                <article key={title} className="landing-feature rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-7">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary-emphasis sm:size-12"><Icon className="size-4 sm:size-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 text-base font-bold sm:mt-7 sm:text-lg">{title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-foreground-soft sm:mt-3 sm:text-sm sm:leading-7">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="for-everyone" className="scroll-mt-16 bg-background py-12 sm:scroll-mt-18 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="text-center"><p className="landing-eyebrow">Made for the MSEUF-CI OJT program</p><h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-5xl">Different roles. One shared journey.</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-foreground-soft sm:mt-5 sm:text-base sm:leading-8">Each person in our school&apos;s internship program sees the work relevant to them, with a clearer view of the journey from their side.</p></div>
            <div className="mt-7 grid gap-3 sm:mt-11 sm:gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roles.map(({ Icon, title, detail, items }) => (
                <article key={title} className="landing-feature flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12"><Icon className="size-4 sm:size-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 text-base font-bold sm:mt-6 sm:text-lg">{title}</h3>
                  <p className="mt-2 text-[13px] leading-5 text-foreground-soft sm:mt-3 sm:min-h-20 sm:text-sm sm:leading-6">{detail}</p>
                  <ul className="mt-4 space-y-2 border-t border-border pt-4 sm:mt-5 sm:space-y-3 sm:pt-5">
                    {items.map((item) => <li key={item} className="flex items-start gap-2 text-[13px] text-foreground-soft sm:text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary-emphasis" aria-hidden="true" />{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-canvas px-4 py-9 sm:px-8 sm:py-16 lg:px-12">
          <div className="landing-final mx-auto flex max-w-7xl flex-col gap-5 overflow-hidden rounded-3xl bg-primary px-5 py-7 text-primary-foreground sm:gap-8 sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:justify-between lg:px-14">
            <div className="relative max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary-foreground/70 sm:text-xs sm:tracking-[0.18em]">Your next step</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:mt-3 sm:text-4xl">Make room for the work that moves you forward.</h2><p className="mt-3 text-[13px] leading-6 text-primary-foreground/75 sm:mt-4 sm:text-base sm:leading-7">Sign in to your MSEUF-CI OJT workspace and continue your internship journey.</p></div>
            <button type="button" onClick={() => setSignInOpen(true)} className="relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#efefef] px-5 text-[13px] font-bold text-[#710000] transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:min-h-12 sm:px-6 sm:text-sm">Go to login <ArrowRight className="size-4" aria-hidden="true" /></button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:gap-5 sm:px-8 sm:py-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <div className="flex items-center gap-3"><Image src={logo} alt="" width={36} height={36} className="size-9 shrink-0 object-contain" /><div><p className="font-bold text-primary-emphasis">EU-Connect</p><p className="max-w-sm text-xs text-foreground-soft">Manuel S. Enverga University Foundation - Candelaria Incorporated</p></div></div>
          <p className="text-xs text-foreground-soft">© {new Date().getFullYear()} EU-Connect. Exclusively for the MSEUF-CI OJT program.</p>
        </div>
      </footer>
    </div>
    <DialogContent overlayClassName="bg-black/45 backdrop-blur-[3px]" className={cn(modalFormContentClass, "block overflow-y-auto")}>
      <DialogTitle className="sr-only">Sign in to EU-Connect</DialogTitle>
      <DialogDescription className="sr-only">Enter your school credentials to open your OJT workspace.</DialogDescription>
      <LoginForm />
    </DialogContent>
    </Dialog>
  );
}
