export default [
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
];
