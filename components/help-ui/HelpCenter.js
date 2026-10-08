"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronDown, CircleHelp, Mail, Phone, Search, X } from "lucide-react";
import PageTitle from "@/components/ui/PageTitle";
import { useUser } from "@/contexts/UserContext";

const roleNames = {
  student: "Student",
  employer: "Employer",
  department_head: "Department Head",
  admin: "Administrator",
};

const roleGuides = {
  student: [
    {
      title: "Start an internship record",
      summary: "Create a record and understand when internship tools become available.",
      steps: [
        "Open My Records and create an internship record with your placement details.",
        "Check the record status there. Some tools require an ongoing internship and will not be available while a record is pending.",
      ],
      href: "/student/internship-record",
      linkText: "Open My Records",
    },
    {
      title: "Clock in, take a break, and clock out",
      summary: "Record duty time from your dashboard.",
      steps: [
        "Use Clock in on the Today card when you arrive at your assigned location.",
        "After clocking in, use Start break and Resume duty to pause and continue counted duty time.",
        "Use Clock out when duty ends. If a location check fails, allow location access and confirm you are within the assigned area.",
      ],
      href: "/student",
      linkText: "Open dashboard",
    },
    {
      title: "Submit weekly narratives",
      summary: "Keep a record of your internship work each week.",
      steps: [
        "Open Narratives to write and review your weekly entries.",
        "An ongoing internship is required. If none is available, check the status in My Records.",
      ],
      href: "/student/narratives",
      linkText: "Open Narratives",
    },
    {
      title: "Upload documents and complete evaluations",
      summary: "Find the two places for internship files and feedback.",
      steps: [
        "Use Storage to upload and manage your internship documents.",
        "Use Evaluations to view and complete evaluation tasks that are available to you.",
      ],
      href: "/student/storage",
      linkText: "Open Storage",
    },
    {
      title: "Plan internship days on the calendar",
      summary: "See internship dates and add private daily to-dos.",
      steps: [
        "Open Calendar to see your ongoing internship dates, announcement event dates, and school schedules.",
        "Select a day within your internship, then choose Add to-do. You can edit or remove your own tasks later.",
        "Use the calendar filters to show only the types of items you need.",
      ],
      href: "/calendar",
      linkText: "Open Calendar",
    },
    {
      title: "Share your location for DTR setup",
      summary: "Help authorized staff set an accurate attendance location.",
      steps: [
        "On your dashboard map, select Share location and allow browser location access when prompted.",
        "Keep the page open while staff view your temporary position in Set DTR Location. The accuracy shown is an estimate.",
        "Select Stop sharing when finished. Clock in and clock out still use their own location checks.",
      ],
      href: "/student",
      linkText: "Open dashboard",
    },
    {
      title: "Review past internships",
      summary: "Find completed placements and their available documents.",
      steps: ["Open Past Internships and select a placement to review its saved details and files."],
      href: "/past-internships",
      linkText: "Open Past Internships",
    },
  ],
  employer: [
    {
      title: "Manage internship postings",
      summary: "Create and maintain the opportunities students can find.",
      steps: [
        "Open Internships or select Manage Jobs on your dashboard.",
        "Review your postings there and use the available controls to create or update them.",
      ],
      href: "/internships",
      linkText: "Open Internships",
    },
    {
      title: "Find an intern and review their work",
      summary: "Open a student profile to see the records available to you.",
      steps: [
        "Search Users for the student's name and open their profile.",
        "Use the profile tabs to review internship details, time records, narratives, and evaluations where your role permits.",
      ],
      href: "/users",
      linkText: "Search Users",
    },
    {
      title: "Complete a student evaluation",
      summary: "Find evaluation tasks for an intern you supervise.",
      steps: [
        "Open the student's profile from Search Users.",
        "Select Evaluations and complete any evaluation available for your supervisor relationship.",
      ],
      href: "/users",
      linkText: "Search Users",
    },
    {
      title: "Set an intern's DTR location",
      summary: "Use a map pin or the student's temporarily shared position.",
      steps: [
        "Open the supervised student's internship record and find Set DTR Location.",
        "If the student is sharing a live location, compare its pin and accuracy circle with the workplace before choosing the permitted location and radius.",
        "Save the location. Ask the student to stop sharing after setup.",
      ],
      href: "/users",
      linkText: "Search Users",
    },
    {
      title: "Use the header calendar",
      summary: "Check dates without leaving your current page.",
      steps: ["Select the calendar icon beside notifications to view a simple month calendar. The full internship planning page is available to school roles only."],
      href: "/employer",
      linkText: "Open dashboard",
    },
  ],
  department_head: [
    {
      title: "Review internship records",
      summary: "Check a student's placement and supporting work.",
      steps: [
        "Open Records to find internship records for your department.",
        "Open a record to review its overview, time records, narratives, evaluations, and documents.",
      ],
      href: "/internship-records",
      linkText: "Open Records",
      hideForRegistrar: true,
    },
    {
      title: "Track student hours",
      summary: "Use the dashboard's course filter and student search.",
      steps: [
        "On your dashboard, find Student Hours Tracker.",
        "Filter by course or search a student's name, then open their profile for more detail.",
      ],
      href: "/department_head",
      linkText: "Open dashboard",
      hideForRegistrar: true,
    },
    {
      title: "Explore internship locations",
      summary: "See companies and interns on the map.",
      steps: [
        "Open Map to view placement pins or switch to the companies view.",
        "Select a pin or company to inspect its interns and location details.",
      ],
      href: "/map",
      linkText: "Open Map",
    },
    {
      title: "View SIPP reports",
      summary: "Find the reports available to the registrar department.",
      steps: ["Open SIPP Reports from the sidebar to review the available report views."],
      href: "/department_head/sipp-reports",
      linkText: "Open SIPP Reports",
      onlyRegistrar: true,
    },
    {
      title: "Publish department schedules",
      summary: "Add internship deadlines and notify students in your department.",
      steps: [
        "Open Calendar and select Add schedule. Enter its title, dates, and optional details.",
        "Publish it to notify students in your department. Select a scheduled day to review it or edit a schedule you created.",
      ],
      href: "/calendar",
      linkText: "Open Calendar",
    },
    {
      title: "Post department announcements",
      summary: "Share updates and optional event dates with students.",
      steps: [
        "Open Announcements and select Announce. Choose the appropriate category and add an event date when the update concerns a specific day.",
        "Review the announcement after posting. Its event date appears on the calendar for students who can see it.",
      ],
      href: "/announcements",
      linkText: "Open Announcements",
    },
    {
      title: "Set a student's DTR location",
      summary: "Use a shared position to help place the attendance pin.",
      steps: [
        "Open the student's internship record and find Set DTR Location.",
        "Ask the student to share their location from their dashboard, then check the live pin and its accuracy before setting the workplace location and radius.",
      ],
      href: "/internship-records",
      linkText: "Open Records",
      hideForRegistrar: true,
    },
    {
      title: "Browse past internships",
      summary: "Review completed placements and available documents.",
      steps: ["Open Past Internships, find a placement, and inspect its saved record and documents."],
      href: "/past-internships",
      linkText: "Open Past Internships",
    },
  ],
  admin: [
    {
      title: "Manage accounts, departments, and courses",
      summary: "Maintain the people and academic structure used by the system.",
      steps: [
        "Use Accounts to create and manage user accounts.",
        "Use Departments & Courses to maintain the choices used across student records and reports.",
      ],
      href: "/admin/create-account",
      linkText: "Open Accounts",
    },
    {
      title: "Review activity logs",
      summary: "Find recent actions and narrow them with the page filters.",
      steps: ["Open Activity Logs, then use its search and filters to locate the action you need."],
      href: "/admin/activity-logs",
      linkText: "Open Activity Logs",
    },
    {
      title: "Inspect cache monitoring",
      summary: "Understand request counts, hits, misses, and cache performance.",
      steps: [
        "Open Cache Monitoring to view metrics by endpoint.",
        "A hit means a request was served from cached data; a miss means it was not.",
      ],
      href: "/admin/cache-monitoring",
      linkText: "Open Cache Monitoring",
    },
    {
      title: "Set evaluation criteria",
      summary: "Maintain the criteria used in evaluations.",
      steps: ["Open Evaluation Criteria to review and update the available criteria."],
      href: "/admin/evaluation-criteria",
      linkText: "Open Evaluation Criteria",
    },
    {
      title: "Review placement locations and records",
      summary: "Inspect internships across the system.",
      steps: [
        "Use Map to explore internship locations and companies.",
        "Use Records to open an internship and review its work and documents.",
      ],
      href: "/internship-records",
      linkText: "Open Records",
    },
    {
      title: "Investigate backend errors",
      summary: "Read grouped server failures and background-job errors.",
      steps: [
        "Open Error Tracking and adjust the date, method, source, status, or search filters.",
        "Select a group to see recent occurrences, request IDs, and available code locations. Only unexpected errors and server failures are recorded; an empty list can be normal.",
      ],
      href: "/admin/error-tracking",
      linkText: "Open Error Tracking",
    },
    {
      title: "Publish school-wide schedules",
      summary: "Place internship deadlines on the calendar for students.",
      steps: [
        "Open Calendar and choose Add schedule. Set the dates and optional details, then publish it.",
        "School-wide schedules notify students. Select a scheduled day to review or manage its entry.",
      ],
      href: "/calendar",
      linkText: "Open Calendar",
    },
    {
      title: "Post general announcements",
      summary: "Share school-wide updates and event dates.",
      steps: [
        "Open Announcements and select Announce. Add the title and content, plus an event date when applicable.",
        "Review the post on the announcement page. Its event date also appears on the calendar.",
      ],
      href: "/announcements",
      linkText: "Open Announcements",
    },
    {
      title: "Set a student's DTR location",
      summary: "Use the student's shared position when choosing an attendance area.",
      steps: [
        "Open the student's internship record and find Set DTR Location.",
        "If the student shares a live position, review its accuracy and set the workplace pin and permitted radius before saving.",
      ],
      href: "/internship-records",
      linkText: "Open Records",
    },
  ],
};

const sharedGuides = [
  {
    title: "Find announcements and opportunities",
    summary: "Use the links available to every account.",
    steps: [
      "Open Announcements for general and department updates. Announcements with event dates also appear on the school calendar where available.",
      "Open Internships to browse available postings, or Search Users to find a profile.",
    ],
    href: "/announcements",
    linkText: "Open Announcements",
  },
  {
    title: "Check notifications",
    summary: "See updates and clear unread items.",
    steps: [
      "Select the bell in the header to load recent notifications. Use its page controls to browse older items and select an item to open the related page.",
      "Open notification center for the full list. You can mark items as read or delete them there.",
    ],
    href: "/notifications",
    linkText: "Open Notifications",
  },
  {
    title: "Search people and return to profiles",
    summary: "Find an account and revisit a recently viewed profile.",
    steps: [
      "Open Search Users and enter a name or other available search term.",
      "Select a result to view the information your role can access. Use recently viewed history to return to a profile.",
    ],
    href: "/users",
    linkText: "Search Users",
  },
  {
    title: "Update your account or password",
    summary: "Find profile and security settings.",
    steps: [
      "Select your profile card near the bottom of the sidebar to open your account page.",
      "Use the account page's security section for password changes and other available settings.",
    ],
    href: null,
    linkText: "Open my account",
  },
  {
    title: "Why is an internship tool unavailable?",
    summary: "Understand empty states and access restrictions.",
    steps: [
      "Some student tools require an ongoing internship record. Check the status in My Records.",
      "Other screens are limited by role. If you believe you need access, contact your department or system administrator.",
    ],
    href: "/student/internship-record",
    linkText: "Open My Records",
    studentOnly: true,
  },
];

function GuideCard({ guide, accountHref }) {
  const href = guide.href ?? accountHref;

  return (
    <details className="group rounded-xl border border-border bg-card transition-colors open:border-primary-emphasis/40">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-4 marker:hidden sm:p-5 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-semibold text-foreground">{guide.title}</span>
          <span className="mt-1 block text-sm text-foreground-soft">{guide.summary}</span>
        </span>
        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-foreground-soft transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-border px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-foreground-soft">
          {guide.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary-emphasis hover:underline">
          {guide.linkText} <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </details>
  );
}

export default function HelpCenter() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const role = user?.role;
  const accountHref = `/${role}/account`;
  const isRegistrar = user?.department_code === "REG";

  const sections = useMemo(() => {
    const specific = (roleGuides[role] ?? []).filter((guide) =>
      (!guide.onlyRegistrar || isRegistrar) && (!guide.hideForRegistrar || !isRegistrar)
    );
    return [
      { title: `${roleNames[role] ?? "Your"} guides`, guides: specific },
      { title: "Shared tools and account", guides: sharedGuides.filter((guide) => !guide.studentOnly || role === "student") },
    ];
  }, [role, isRegistrar]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = sections.map((section) => ({
    ...section,
    guides: section.guides.filter((guide) =>
      !normalizedQuery || [guide.title, guide.summary, ...guide.steps].join(" ").toLowerCase().includes(normalizedQuery)
    ),
  })).filter((section) => section.guides.length);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageTitle Icon={CircleHelp} title="Help" description="Find answers and follow the steps for your role in EU-Connect." />

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary-emphasis">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {roleNames[role] ?? "User"} guide
        </div>
        <p className="mt-2 text-sm text-foreground-soft">Search a task, then open a guide for steps and a link to the right page.</p>
        <div className="relative mt-4 max-w-2xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-soft" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help, e.g. clock in or evaluations"
            aria-label="Search help guides"
            className="w-full rounded-lg border border-border bg-canvas py-2.5 pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-foreground-soft focus:border-primary-emphasis focus:ring-2 focus:ring-primary-emphasis/20"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-soft hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {visibleSections.length ? visibleSections.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-base font-bold text-foreground sm:text-lg">{section.title}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {section.guides.map((guide) => <GuideCard key={guide.title} guide={guide} accountHref={accountHref} />)}
          </div>
        </section>
      )) : (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h2 className="font-semibold">No matching guides</h2>
          <p className="mt-1 text-sm text-foreground-soft">Try a different task or shorter search term.</p>
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <h2 className="font-semibold">Still need help?</h2>
        <p className="mt-1 text-sm text-foreground-soft">For account access or a record that looks incorrect, contact the EU-Connect administrator. Include the page name and a brief description of the issue.</p>
        <div className="mt-4 flex flex-col gap-3 text-sm sm:flex-row sm:gap-6">
          <a href="mailto:admin@example.com" className="inline-flex items-center gap-2 font-medium text-primary-emphasis hover:underline">
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            admin@example.com
          </a>
          <a href="tel:+639000000000" className="inline-flex items-center gap-2 font-medium text-primary-emphasis hover:underline">
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            +63 900 000 0000
          </a>
        </div>
        <p className="mt-3 text-xs text-foreground-soft">Sample contact details. Replace these with the administrator&apos;s actual email and number before use.</p>
      </section>
    </div>
  );
}
