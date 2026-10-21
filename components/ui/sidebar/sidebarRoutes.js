import {
  Activity,
  AlertTriangle,
  BookOpen,
  CalendarDays,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Gauge,
  Layers,
  LayoutDashboard,
  LibraryBig,
  MapPin,
  Megaphone,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";

function roleRouteGroups(userRole, userDepartment) {
  if (userRole === "student") {
    return [
      {
        label: "Student",
        routes: [
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
            name: "My Records",
            href: "/student/internship-record",
            icon: <LibraryBig className="h-5 w-5 shrink-0" />,
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
            icon: <Building2 className="h-5 w-5 shrink-0" />,
          },
        ],
      },
    ];
  }

  if (userRole === "department_head") {
    const staffRoutes = [];
    if (userDepartment === "REG") {
      staffRoutes.push({
        name: "SIPP Reports",
        href: "/department_head/sipp-reports",
        icon: <FileText className="h-5 w-5 shrink-0" />,
      });
    }

    staffRoutes.push(
      {
        name: "Map",
        href: "/map",
        icon: <MapPin className="h-5 w-5 shrink-0" />,
      },
      {
        name: "Past Internships",
        href: "/past-internships",
        icon: <Building2 className="h-5 w-5 shrink-0" />,
      },
    );

    if (userDepartment !== "REG") {
      staffRoutes.push({
        name: "Records",
        href: "/internship-records",
        icon: <LibraryBig className="h-5 w-5 shrink-0" />,
      });
    }

    return [{ label: "Staff tools", routes: staffRoutes }];
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
          {
            name: "Activity Logs",
            href: "/admin/activity-logs",
            icon: <Activity className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Error Tracking",
            href: "/admin/error-tracking",
            icon: <AlertTriangle className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Cache Monitoring",
            href: "/admin/cache-monitoring",
            icon: <Gauge className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Evaluation Criteria",
            href: "/admin/evaluation-criteria",
            icon: <SlidersHorizontal className="h-5 w-5 shrink-0" />,
          },
        ],
      },
      {
        label: "Staff tools",
        routes: [
          {
            name: "Map",
            href: "/map",
            icon: <MapPin className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Records",
            href: "/internship-records",
            icon: <LibraryBig className="h-5 w-5 shrink-0" />,
          },
          {
            name: "Past Internships",
            href: "/past-internships",
            icon: <Building2 className="h-5 w-5 shrink-0" />,
          },
        ],
      },
    ];
  }

  return [];
}

const publicRoutes = [
  {
    name: "Announcements",
    href: "/announcements",
    icon: <Megaphone className="h-5 w-5 shrink-0" />,
  },
  {
    name: "Internships",
    href: "/internships",
    icon: <BriefcaseBusiness className="h-5 w-5 shrink-0" />,
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

export function getSidebarRouteGroups(userRole, userDepartment, homeHref) {
  return (
    [
      ...(userDepartment !== "REG"
        ? [
            {
              label: "Overview",
              routes: [
                {
                  name: "Dashboard",
                  href: homeHref,
                  icon: <LayoutDashboard size={20} />,
                  exact: true,
                },
              ],
            },
          ]
        : []),
      ...roleRouteGroups(userRole, userDepartment),
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
      { label: "Public", routes: publicRoutes.filter(route => userRole !== "employer" || route.href !== "/announcements") },
    ]
  );
}

export { roleRouteGroups, publicRoutes, getFormattedRole };
