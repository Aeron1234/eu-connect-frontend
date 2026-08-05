"use client";

import { format } from "date-fns";
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
import Link from "next/link";
import { useMemo, useState } from "react";

const scopeTabs = [
  { label: "All Companies", href: "all" },
  { label: "My Posts", href: "myposts" },
];

const workTypeTabs = [
  { label: "All", href: "all" },
  { label: "On-site", href: "on-site" },
  { label: "Hybrid", href: "hybrid" },
  { label: "Remote", href: "remote" },
];

const workTypeStyles = {
  "on-site": "border-sky-200 bg-sky-50 text-sky-700",
  hybrid: "border-violet-200 bg-violet-50 text-violet-700",
  remote: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function InternshipPosts({
  courseFilter = "all",
  workTypeFilter = "all",
  scopeFilter = "all",
  userRole,
  internshipPosts = [],
  pagination = {},
  courses = [],
}) {
  const [courseId, setCourseId] = useState("");
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  function companyNameInitials(companyName) {
    const splitted = companyName.split(" ");
    let initials = splitted.map((s) => s.charAt(0)).join("");

    return initials.length < 2
      ? initials.toLocaleUpperCase()
      : initials.slice(0, 3).toLocaleUpperCase();
  }

  return (
    <>
      {/* Filters */}

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex rounded-lg bg-stone-200 p-1">
          {scopeTabs.map((s) => (
            <Link
              key={s.href}
              href={`/internships?scope=${s.href}&course=${courseFilter}&work_type=${workTypeFilter}`}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                scopeFilter === s.href
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-stone-200 text-muted-foreground hover:text-primary-500"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

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
      </div>

      {courses.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {/* All button in courses*/}
          <Link
            href={`/internships?scope=${scopeFilter}&course=all&work_type=${workTypeFilter}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              courseFilter === "all"
                ? "bg-primary-500 text-primary-foreground"
                : "bg-stone-200 text-muted-foreground hover:text-primary-500"
            }`}
          >
            All
          </Link>
          {courses.map((c) => (
            <Link
              key={c.id}
              onClick={() => setCourseId(c.id)}
              href={`/internships?scope=${scopeFilter}&course=${c.short_name.toLowerCase()}&work_type=${workTypeFilter}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                courseFilter === c.short_name.toLowerCase()
                  ? "bg-primary-500 text-primary-foreground"
                  : "bg-stone-200 text-muted-foreground hover:text-primary-500"
              }`}
            >
              {c.short_name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {workTypeTabs.map((t) => (
          <Link
            key={t.label}
            href={`/internships?scope=${scopeFilter}&course=${courseFilter}&work_type=${t.href.toLowerCase()}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              workTypeFilter === t.href.toLowerCase()
                ? "bg-primary-500 text-primary-foreground"
                : "bg-stone-200 text-muted-foreground hover:text-primary-500"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {pagination?.total ? pagination.total : null} listings
      </p>

      {/* Listings */}
      <div className="space-y-5">
        {internshipPosts.map((l) => {
          const isFavorited = favoriteIds.has(l.id);
          return (
            <article
              key={l.id}
              className="rounded-xl border border-border bg-background p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-xs font-bold text-primary-foreground">
                    {companyNameInitials(l.company_name)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-bold">
                      {l.position}
                      {l.isOwner && (
                        <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-semibold text-primary-500">
                          My Post
                        </span>
                      )}
                    </h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {l.company_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${workTypeStyles[l.work_type]}`}
                  >
                    {l.work_type}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-foreground/80">
                    <Users className="h-4 w-4 text-muted-foreground" />{" "}
                    {l.vacancies} vacancies
                  </span>
                  {l.isOwner && (
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
                  {!l.isOwner && userRole === "student" && (
                    <button
                      type="button"
                      onClick={() => toggleFavorite(l.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        isFavorited
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-primary-500 text-primary-foreground hover:bg-primary-500-deep"
                      }`}
                    >
                      {isFavorited && <Check className="h-3.5 w-3.5" />}
                      {isFavorited ? "Favorite" : "Mark as Favorite"}
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
                    <Clock className="h-3.5 w-3.5" /> {l.duration_hours} hours
                  </span>
                  {l.courses.length > 0 ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground/70">
                        Course:
                      </span>{" "}
                      <ul>
                        {l.courses.map((c) => (
                          <li key={c.id}>{c.shortName}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
                <span>
                  Posted {format(new Date(l.created_at), "mm-dd-yyyy")}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold text-foreground/70">
                  Requirements:
                </p>
                <ul className="mt-2 space-y-1.5 list-inside">
                  {l.requirements.split("\n").map((r, i) => (
                    <li
                      key={i}
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
                  <span className="font-medium">{l.contact_name}</span>
                  <a
                    href={`mailto:${l.contact_email}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
                  >
                    <Mail className="h-3.5 w-3.5" /> {l.contact_email}
                  </a>
                  <a
                    href={`tel:${l.contact_phone.replace(/[^\d+]/g, "")}`}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
                  >
                    <Phone className="h-3.5 w-3.5" /> {l.contact_phone}
                  </a>
                  <a
                    href={`https://${l.contact_website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-500"
                  >
                    <Globe className="h-3.5 w-3.5" /> {l.contact_website}
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {internshipPosts.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            No internship listings found.
          </p>
        )}
      </div>
    </>
  );
}

export default InternshipPosts;
