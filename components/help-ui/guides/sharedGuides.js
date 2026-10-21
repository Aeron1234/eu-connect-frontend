export default [
  {
    title: "Find announcements and opportunities",
    summary: "Read school updates and browse internship opportunities.",
    hideForEmployer: true,
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
