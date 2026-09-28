import { redirect } from "next/navigation";
// import { auth } from "./_services/auth";
import Image from "next/image";
import logo from "@/public/logo.png";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Clock,
  FileText,
  Globe,
  Phone,
  Users,
} from "lucide-react";
import { getUserSession } from "../lib/server-actions/auth";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
];

const stats = [
  { value: "500+", label: "Students Managed" },
  { value: "80+", label: "Partner Companies" },
  { value: "12", label: "Departments" },
  { value: "100", label: "Active OJT Placements" },
];

const features = [
  {
    icon: Clock,
    title: "Time Tracking",
    body: "Students log daily time-in and time-out records with GPS-verified location stamps, generating accurate DTR reports automatically.",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    body: "Purpose-built dashboards for students, department heads, and employers — each seeing exactly what they need, nothing they don't.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Real-time completion tracking, evaluation summaries, and internship progress charts give department heads full visibility at a glance.",
  },
  {
    icon: FileText,
    title: "Document Management",
    body: "Centralized upload and review for MOAs, endorsement letters, medical certificates, and all pre- and post-OJT requirements.",
  },
  {
    icon: Phone,
    title: "Evaluation System",
    body: "Structured rubrics with category scores submitted by company supervisors, reviewed and archived for official grading records.",
  },
  {
    icon: Globe,
    title: "Internship Map",
    body: "Geographic visualization of all active OJT placements across the Philippines — filter by city, company, and course.",
  },
];

const roles = [
  {
    role: "Student",
    tone: "bg-primary-500",
    steps: [
      "Apply for OJT endorsement",
      "Submit required documents",
      "Log daily time records",
      "Submit weekly narratives",
      "Receive supervisor evaluations",
    ],
  },
  {
    role: "Department Head",
    tone: "bg-primary-700",
    steps: [
      "Review student applications",
      "Post available internships",
      "Monitor hours and progress",
      "Post announcements",
      "Review submitted evaluations",
    ],
  },
  {
    role: "Company",
    tone: "bg-primary-500",
    steps: [
      "Receive intern profiles",
      "Confirm intern placements",
      "Sign digital MOA",
      "Submit evaluations",
      "View intern performance",
    ],
  },
];

async function HomePage() {
  const session = await getUserSession();
  const user = session?.user;
  const role = session?.user?.role;

  if (
    user &&
    ["student", "employer", "department_head", "admin"].includes(role)
  )
    redirect(`/${role}`);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <a href="#top" className="flex items-center gap-3">
            <Image
              src={logo}
              alt="Manuel S. Enverga University Foundation seal"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-xl font-bold text-primary-500">
              EU-Connect
            </span>
          </a>
          <nav className="hidden items-center gap-9 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted-foreground transition-colors hover:text-primary-500"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <Link
            href={"/login"}
            className="rounded-md bg-primary-500 px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-700"
          >
            Login
          </Link>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary-500 pb-40 pt-24 text-primary-foreground">
          <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Internship Management Platform
              </span>
              <h1 className="mt-8 font-display text-5xl font-bold leading-[1.08] sm:text-6xl">
                Connecting Interns to Opportunities
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-primary-foreground/80">
                Track hours, manage records, and monitor progress — a unified
                platform for students, employers, and department heads.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <Link
                  href={"/login"}
                  className="inline-flex items-center gap-2 rounded-md bg-background px-6 py-3.5 text-sm font-semibold text-primary-500 transition-transform hover:-translate-y-0.5"
                >
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#about"
                  className="text-sm font-medium text-primary-foreground/90"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="relative mx-auto hidden h-96 w-full max-w-md lg:block">
              <div className="absolute left-1/2 top-1/2 flex h-55 w-55 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background shadow-xl">
                <Image
                  src={logo}
                  alt="Manuel S. Enverga University Foundation seal"
                  width={200}
                  height={200}
                  className="h-50 w-50 object-contain"
                />
              </div>
              <div className="absolute left-0 top-8 rounded-xl bg-background px-5 py-3 shadow-lg">
                <p className="text-xs text-muted-foreground">Active Interns</p>
                <p className="font-display text-2xl font-bold text-primary-500">
                  124
                </p>
              </div>
              <div className="absolute right-0 top-0 rounded-xl bg-primary-700 px-5 py-3 shadow-lg">
                <p className="text-xs text-primary-foreground/70">
                  Partner Companies
                </p>
                <p className="font-display text-2xl font-bold">80+</p>
              </div>
              <div className="absolute -right-2 bottom-16 rounded-xl bg-background px-5 py-3 shadow-lg">
                <p className="text-xs text-muted-foreground">Hours Logged</p>
                <p className="font-display text-2xl font-bold text-primary-500">
                  12,400+
                </p>
              </div>
            </div>
          </div>
          <div
            className="absolute -bottom-1 left-0 h-24 w-full rounded-[100%_100%_0_0] bg-background"
            aria-hidden="true"
          />
        </section>

        {/* Stats */}
        <Stats stats={stats} />

        {/* About */}
        <About logo={logo} />

        {/* Features */}
        <Features features={features} />

        {/* How it works */}
        <HowItWorks roles={roles} />

        {/* CTA */}
        <CTA />
      </main>

      {/* FOOTER */}
      <Footer logo={logo} />
    </div>
  );
}

function Stats({ stats }) {
  return (
    <section className="bg-background py-14">
      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 px-6 text-center md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-4xl font-bold text-primary-500">
              {s.value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function About({ logo }) {
  return (
    <section id="about" className="bg-[#FAF9F7] py-14">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-primary-500 p-10 text-primary-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background">
            <Image
              src={logo}
              alt="MSEUF-CI seal"
              width={48}
              height={48}
              className="h-14 w-14 object-contain"
            />
          </div>
          <p className="mt-10 text-xs uppercase tracking-[0.15em] text-primary-foreground/70">
            Manuel S. Enverga University Foundation
          </p>
          <h3 className="mt-3 font-display text-3xl font-bold leading-snug">
            Candelaria, Quezon
            <br />
            Philippines
          </h3>
          <div className="mt-8 grid grid-cols-2 gap-6 border-t border-primary-foreground/20 pt-8 text-sm">
            {[
              ["Established", "1946"],
              ["Departments", "12"],
              ["Campus", "Candelaria-Inc."],
              ["Accreditation", "CHED"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-primary-foreground/70">{k}</p>
                <p className="font-semibold">{v}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500 ">
            About the System
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight">
            A smarter way to manage student internships
          </h2>
          <div className="mt-6 h-1 w-14 rounded bg-primary-500" />
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            EU-Connect is a streamlined digital platform designed to efficiently
            manage internship processes in MSEUF-CI between the students,
            university, and companies.
          </p>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Built specifically for the On-the-Job Training program, EU-Connect
            eliminates paperwork bottlenecks and replaces manual tracking with a
            secure, role-based digital workflow — making the OJT journey
            smoother for everyone involved.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "Paperless document submission and review",
              "Real-time OJT hour tracking and progress monitoring",
              "Structured supervisor evaluation and grading",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
                  <Check className="h-3 w-3 text-primary-500" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Features({ features }) {
  return (
    <section id="features" className="bg-background py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Features
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold">
            Everything You Need
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Powerful tools designed for every role in the internship lifecycle.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article
              key={f.title}
              className="rounded-xl border border-border p-7 transition-shadow hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                <f.icon className="h-5 w-5 text-primary-500" />
              </span>
              <h3 className="mt-6 font-display text-lg font-bold">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ roles }) {
  return (
    <section id="how-it-works" className="bg-[#FAF9F7] py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
            Workflow
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold">
            Built for Every Role
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Each role has a tailored experience within a single integrated
            system.
          </p>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {roles.map((r) => (
            <div
              key={r.role}
              className="overflow-hidden rounded-xl border border-border bg-background"
            >
              <div className={`${r.tone} px-7 py-6 text-primary-foreground`}>
                <p className="text-xs uppercase tracking-[0.15em] text-primary-foreground/70">
                  Role
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold">
                  {r.role}
                </h3>
              </div>
              <ol className="space-y-4 px-7 py-7">
                {r.steps.map((step, i) => (
                  <li key={step} className="flex items-center gap-3 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-primary-500">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section
      id="cta"
      className="bg-primary-500 py-14 text-center text-primary-foreground"
    >
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="font-display text-4xl font-bold">
          Ready to get started?
        </h2>
        <p className="mt-5 text-lg text-primary-foreground/80">
          Log in with your university credentials to access your personalized
          OJT dashboard.
        </p>
        <Link
          href={"/login"}
          className="mt-10 inline-flex rounded-md bg-background px-8 py-4 text-sm font-semibold text-primary-500 transition-transform hover:-translate-y-0.5"
        >
          Access EU-Connect
        </Link>
      </div>
    </section>
  );
}

function Footer({ logo }) {
  return (
    <footer className="bg-primary-700 py-10 text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
          />
          <div>
            <p className="font-display font-bold">EU-Connect</p>
            <p className="text-xs text-primary-foreground/70">
              MSEUF-CI Internship Management
            </p>
          </div>
        </div>
        <p className="text-sm text-primary-foreground/70">
          © 2026 EU-Connect. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default HomePage;
