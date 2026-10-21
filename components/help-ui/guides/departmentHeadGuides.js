export default [
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
      "Open Announcements and select Announce. Post to your department and add an event date when the update concerns a specific day. General announcements can only be posted by admins and registrar department heads.",
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
];
