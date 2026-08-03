"use client";

import {
  Briefcase,
  Check,
  Clock,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const listings = [
  {
    id: 1,
    title: "Software Developer Intern",
    company: "Accenture Philippines",
    initials: "AC",
    mine: true,
    setup: "On-site",
    course: "BS Computer Science",
    vacancies: 5,
    description:
      "Looking for motivated IT/CS students to join our development team. You'll work on real projects using React, Node.js, and cloud technologies.",
    location: "Makati City",
    hours: 460,
    posted: "Jun 1, 2026",
    requirements: [
      "3rd or 4th year IT/CS student",
      "Basic knowledge of HTML/CSS/JS",
      "Willing to work on-site",
    ],
    contactName: "HR Department",
    email: "hr@accenture.ph",
    phone: "(02) 8123-4567",
    website: "accenture.ph",
  },
  {
    id: 2,
    title: "Data Analytics Intern",
    company: "Accenture Philippines",
    initials: "AC",
    mine: true,
    setup: "Hybrid",
    course: "BS Information Systems",
    vacancies: 3,
    description:
      "Join our analytics team and work with large datasets, BI tools, and reporting pipelines in a collaborative hybrid setup.",
    location: "BGC, Taguig",
    hours: 300,
    posted: "May 28, 2026",
    requirements: [
      "IT/IS/CS student",
      "Familiarity with Excel and SQL",
      "Strong analytical skills",
    ],
    contactName: "HR Department",
    email: "hr@accenture.ph",
    phone: "(02) 8123-4567",
    website: "accenture.ph",
  },
  {
    id: 3,
    title: "Software Developer Intern",
    company: "TechCorp Philippines",
    initials: "TC",
    mine: false,
    setup: "On-site",
    course: "BS Information Technology",
    vacancies: 5,
    description:
      "Looking for motivated IT/CS students to join our development team. You'll work on real projects using React, Node.js, and cloud technologies.",
    location: "Makati City",
    hours: 300,
    posted: "Jun 3, 2026",
    requirements: [
      "3rd or 4th year IT/CS student",
      "Basic knowledge of HTML/CSS/JS",
      "Willing to work on-site",
    ],
    contactName: "HR Department",
    email: "hr@techcorp.ph",
    phone: "(02) 8123-4567",
    website: "techcorp.ph",
  },
  {
    id: 4,
    title: "Data Analyst Intern",
    company: "DataWave Solutions",
    initials: "DW",
    mine: false,
    setup: "Hybrid",
    course: "BS Information Systems",
    vacancies: 3,
    description:
      "Join our analytics team and gain hands-on experience with data visualization, SQL databases, and business intelligence tools.",
    location: "BGC, Taguig",
    hours: 486,
    posted: "Jun 5, 2026",
    requirements: [
      "IT/IS/CS student",
      "Familiarity with Excel and SQL",
      "Strong analytical skills",
    ],
    contactName: "Ms. Ana Cruz",
    email: "internships@datawave.ph",
    phone: "(02) 8765-4321",
    website: "datawave.ph",
  },
  {
    id: 5,
    title: "UI/UX Design Intern",
    company: "Pixel Studio",
    initials: "PS",
    mine: false,
    setup: "Remote",
    course: "BS Multimedia Arts",
    vacancies: 2,
    description:
      "Support our product team in wireframing, prototyping, and usability testing for client web and mobile products.",
    location: "Remote",
    hours: 320,
    posted: "Jun 8, 2026",
    requirements: [
      "IT/Multimedia student",
      "Portfolio of design work",
      "Knowledge of Figma",
    ],
    contactName: "Mr. Leo Santos",
    email: "careers@pixelstudio.ph",
    phone: "(02) 8990-2211",
    website: "pixelstudio.ph",
  },
  {
    id: 6,
    title: "Network Administrator Intern",
    company: "SysNet Solutions",
    initials: "SN",
    mine: false,
    setup: "On-site",
    course: "BS Information Technology",
    vacancies: 4,
    description:
      "Assist in maintaining network infrastructure, configuring routers and switches, and supporting IT operations.",
    location: "Quezon City",
    hours: 350,
    posted: "Jun 10, 2026",
    requirements: [
      "IT/Network Engineering student",
      "Basic knowledge of TCP/IP",
      "Willing to work on-site",
    ],
    contactName: "Mr. Ryan Cruz",
    email: "careers@sysnet.ph",
    phone: "(02) 8123-9876",
    website: "sysnet.ph",
  },
];

const scopeTabs = ["All Companies", "My Posts"];
const courseTabs = [
  "All",
  "BS Computer Science",
  "BS Information Technology",
  "BS Information Systems",
  "BS Multimedia Arts",
];

const setupStyles = {
  "On-site": "border-sky-200 bg-sky-50 text-sky-700",
  Hybrid: "border-violet-200 bg-violet-50 text-violet-700",
  Remote: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function InternshipPosts() {
  const [scope, setScope] = useState("All Companies");
  const [course, setCourse] = useState("All");
  const [query, setQuery] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());

  const rows = useMemo(() => {
    let list = [...listings];
    if (scope === "My Posts") list = list.filter((l) => l.mine);
    if (course !== "All") list = list.filter((l) => l.course === course);
    const q = query.trim().toLowerCase();
    if (q)
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q),
      );
    return list;
  }, [scope, course, query]);

  const toggleApplied = (id) => {
    setAppliedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-primary-500" />
            Internship Documents Storage
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Upload all of your internship-related files here
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search company or position..."
              className="h-10 w-full md:w-64 pl-9 pr-4 rounded-md bg-white border border-stone-200 focus:border-primary-500/40 focus:outline-none text-sm placeholder:text-stone-400"
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-md text-sm font-semibold hover:opacity-90 transition cursor-pointer shrink-0">
            <Plus className="w-4 h-4" />
            <span className="text-white text-sm font-semibold">Post Job</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg bg-stone-200 p-1">
          {scopeTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setScope(t)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                scope === t
                  ? "bg-primary-500 text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-primary-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {courseTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCourse(t)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                course === t
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-stone-200 text-muted-foreground hover:text-primary-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{rows.length} listings</p>

      {/* Listings */}
      <div className="space-y-5">
        {rows.map((l) => {
          const isApplied = appliedIds.has(l.id);
          return (
            <article
              key={l.id}
              className="rounded-xl border border-border bg-background p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-primary-foreground">
                    {l.initials}
                  </span>
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-bold">
                      {l.title}
                      {l.mine && (
                        <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary-500">
                          My Post
                        </span>
                      )}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {l.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${setupStyles[l.setup]}`}
                  >
                    {l.setup}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-foreground/80">
                    <Users className="h-4 w-4 text-muted-foreground" />{" "}
                    {l.vacancies} vacancies
                  </span>
                  {l.mine && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Edit ${l.title}`}
                        className="text-muted-foreground hover:text-primary-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${l.title}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {!l.mine && (
                    <button
                      type="button"
                      onClick={() => toggleApplied(l.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isApplied
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-primary-500 text-primary-foreground hover:bg-primary-500-deep"
                      }`}
                    >
                      {isApplied && <Check className="h-3.5 w-3.5" />}
                      {isApplied ? "Applied" : "Mark as Applied"}
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-4 text-sm text-foreground/80">{l.description}</p>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {l.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {l.hours} hours
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground/70">
                      Course:
                    </span>{" "}
                    {l.course}
                  </span>
                </div>
                <span>Posted {l.posted}</span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-foreground/70">
                  Requirements:
                </p>
                <ul className="mt-2 space-y-1.5">
                  {l.requirements.map((r) => (
                    <li
                      key={r}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground">
                  Contact Details:
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <span className="font-medium">{l.contactName}</span>
                  <a
                    href={`mailto:${l.email}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
                  >
                    <Mail className="h-3.5 w-3.5" /> {l.email}
                  </a>
                  <a
                    href={`tel:${l.phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
                  >
                    <Phone className="h-3.5 w-3.5" /> {l.phone}
                  </a>
                  <a
                    href={`https://${l.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
                  >
                    <Globe className="h-3.5 w-3.5" /> {l.website}
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            No internship listings found.
          </p>
        )}
      </div>
    </>
  );
}

export default InternshipPosts;
