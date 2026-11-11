import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  ClipboardClock,
  FileText,
  FolderOpen,
  Gauge,
  History,
  Layers,
  LayoutDashboard,
  LibraryBig,
  MapPin,
  Map as MapIcon,
  Megaphone,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";

// Order each role's tools by its common workflow. These links organize navigation;
// pages and APIs still enforce their own access.
function roleRouteGroups(userRole, userDepartment) {
  if (userRole === "student") {
    return [
      {
        label: "Student",
        routes: [
          {
            name: "My Records",
            href: "/student/internship-record",
            icon: <LibraryBig className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Narratives",
            href: "/student/narratives",
            icon: <BookOpen className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Summary Reports",
            href: "/student/summary-reports",
            icon: <FileText className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Storage",
            href: "/student/storage",
            icon: <FolderOpen className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Evaluations",
            href: "/student/evaluations",
            icon: <ClipboardCheck className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Past Internships",
            href: "/past-internships",
            icon: <History className="h-5 w-5 shrink-0" />,
          },
        ],
      },
    ];
  }

  if (userRole === "department_head") {
    if (userDepartment === "REG") {
      return [{
        label: "Staff tools",
        routes: [
          { name: "SIPP Reports", href: "/department_head/sipp-reports", icon: <FileText className="h-5 w-5 shrink-0" /> },
          { name: "Map", href: "/map", icon: <MapIcon className="h-5 w-5 shrink-0" /> },
          { name: "Past Internships", href: "/past-internships", icon: <History className="h-5 w-5 shrink-0" /> },
        ],
      }];
    }

    return [{
      label: "Staff tools",
      routes: [
        { name: "Internship Records", href: "/department_head/internship-records", icon: <LibraryBig className="h-5 w-5 shrink-0" /> },
        { name: "Attendance", href: "/department_head/attendance", icon: <ClipboardClock className="h-5 w-5 shrink-0" /> },
        { name: "DTR Restrictions", href: "/dtr-restrictions", icon: <MapPin className="h-5 w-5 shrink-0" /> },
        { name: "Student Submissions", href: "/department_head/submissions", icon: <FileText className="h-5 w-5 shrink-0" /> },
        { name: "Evaluations", icon: <ClipboardCheck className="h-5 w-5 shrink-0" />, children: [
          { name: "Evaluation Criteria", href: "/department_head/evaluation-criteria", icon: <SlidersHorizontal className="h-4 w-4 shrink-0" /> },
          { name: "Evaluations", href: "/department_head/evaluations", icon: <ClipboardCheck className="h-4 w-4 shrink-0" /> },
          { name: "Evaluated Companies", href: "/department_head/evaluated-companies", icon: <Building2 className="h-4 w-4 shrink-0" /> },
        ] },
        { name: "Company Analytics", href: "/company-analytics", icon: <Building2 className="h-5 w-5 shrink-0" /> },
        { name: "Map", href: "/map", icon: <MapIcon className="h-5 w-5 shrink-0" /> },
        { name: "Past Internships", href: "/past-internships", icon: <History className="h-5 w-5 shrink-0" /> },
      ],
    }];
  }

  if (userRole === "admin") {
    return [
      {
        label: "Administration",
        routes: [
          {
            name: "Accounts",
            href: "/admin/create-account",
            icon: <UserPlus className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Departments & Courses",
            href: "/admin/departments-and-courses",
            icon: <Layers className="h-5 w-5 shrink-0" />,
          },
        ],
      },
      {
        label: "Staff tools",
        routes: [
          { name: "DTR Restrictions", href: "/dtr-restrictions", icon: <MapPin className="h-5 w-5 shrink-0" /> },
          {
            name: "Map",
            href: "/map",
            icon: <MapIcon className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Past Internships",
            href: "/past-internships",
            icon: <History className="h-5 w-5 shrink-0" />,
          },
          { name: "Company Analytics", href: "/company-analytics", icon: <Building2 className="h-5 w-5 shrink-0" /> },
        ],
      },
      {
        label: "System monitoring",
        routes: [
          { name: "Activity Logs", href: "/admin/activity-logs", icon: <Activity className="h-5 w-5 shrink-0" /> },
          { name: "Error Tracking", href: "/admin/error-tracking", icon: <AlertTriangle className="h-5 w-5 shrink-0" /> },
          { name: "Cache Monitoring", href: "/admin/cache-monitoring", icon: <Gauge className="h-5 w-5 shrink-0" /> },
        ],
      },
    ];
  }

  if (userRole === "employer") return [{ label: "Intern tools", routes: [{ name: "DTR Restrictions", href: "/dtr-restrictions", icon: <MapPin className="h-5 w-5 shrink-0" /> }] }];
  return [];
}

const publicRoutes = [
  {
    name: "Internships",
    href: "/internships",
    icon: <BriefcaseBusiness className="h-5 w-5 shrink-0" />,
  },
  {
    name: "Announcements",
    href: "/announcements",
    icon: <Megaphone className="h-5 w-5 shrink-0" />,
  },
  {
    name: "Search Users",
    href: "/users",
    icon: <Users className="h-5 w-5 shrink-0" />,
  },
];

function getFormattedRole(role) {
  switch (role) {
    case "student":
      return "Student";
    case "employer":
      return "Employer";
    case "department_head":
      return "Department Head";
    case "admin":
      return "Administrator";
    default:
      return "User";
  }
}

// Combine role tools with shared links. Employers have Feedback but no full
// Calendar link; students have no Feedback link. Employers can read opted-in announcements.
export function getSidebarRouteGroups(userRole, userDepartment, homeHref) {
  return (
    [
      { label: 'Overview', routes: [{ name: 'Dashboard', href: homeHref, icon: <LayoutDashboard size={20}/>, exact: true }] },
      ...roleRouteGroups(userRole, userDepartment),
      ...(["employer", "department_head", "admin"].includes(userRole) ? [{
        label: "Communication",
        routes: [{ name: "Feedback & Concerns", href: "/feedback", icon: <FileText className="h-5 w-5 shrink-0" /> }],
      }] : []),
      ...(userRole !== "employer" ? [{
        label: "Planning",
        routes: [
          {
            name: "Calendar",
            href: "/calendar",
            icon: <CalendarDays className="h-5 w-5 shrink-0" />,
          },
        ],
      }] : []),
      { label: "Public", routes: publicRoutes },
    ]
  );
}

export { roleRouteGroups, publicRoutes, getFormattedRole };
