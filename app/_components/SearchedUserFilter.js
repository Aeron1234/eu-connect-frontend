import {
  Clock,
  FileCheck,
  FileText,
  FolderOpen,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";

function filterTabs({ userRole, searchedUserId, searchedUserRole = "" }) {
  // 🛡️ Guard Clause: If the user being viewed is an employer, they ONLY have the Info tab.
  if (searchedUserRole !== "student") {
    return [
      {
        href: `/users/${searchedUserId}?filter=info`,
        value: "info",
        text: "Info",
        icon: <User className="w-4 h-4" />,
      },
    ];
  }

  // 1. Setup tabs specifically for Employers viewing a Student
  if (userRole === "employer") {
    return [
      {
        href: `/users/${searchedUserId}?filter=dtr`,
        value: "dtr",
        text: "DTR",
        icon: <Clock className="w-4 h-4" />,
      },
      {
        href: `/users/${searchedUserId}?filter=narratives`,
        value: "narratives",
        text: "Narratives",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        href: `/users/${searchedUserId}?filter=evaluations`,
        value: "evaluations",
        text: "Evaluations",
        icon: <Star className="w-4 h-4" />,
      },
      {
        href: `/users/${searchedUserId}?filter=certificates`,
        value: "certificates",
        text: "Certificates",
        icon: <FileCheck className="w-4 h-4" />,
      },
      {
        href: `/users/${searchedUserId}?filter=info`,
        value: "info",
        text: "Info",
        icon: <User className="w-4 h-4" />,
      },
    ];
  }

  // 2. Setup tabs for Students viewing another Student
  if (userRole === "student") {
    return [
      {
        href: `/users/${searchedUserId}?filter=info`,
        value: "info",
        text: "Info",
        icon: <User className="w-4 h-4" />,
      },
    ];
  }

  // 3. Setup tabs for University Staff (Admin and Dept Head) viewing a Student
  // Handles 'admin' and 'dept_head' roles cleanly.
  return [
    {
      href: `/users/${searchedUserId}?filter=dtr`,
      value: "dtr",
      text: "DTR",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      href: `/users/${searchedUserId}?filter=narratives`,
      value: "narratives",
      text: "Narratives",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      href: `/users/${searchedUserId}?filter=evaluations`,
      value: "evaluations",
      text: "Evaluations",
      icon: <Star className="w-4 h-4" />,
    },
    {
      href: `/users/${searchedUserId}?filter=documents`,
      value: "documents",
      text: "Documents",
      icon: <FolderOpen className="w-4 h-4" />,
    },
    {
      href: `/users/${searchedUserId}?filter=info`,
      value: "info",
      text: "Info",
      icon: <User className="w-4 h-4" />,
    },
  ];
}

function SearchedUserFilter({
  searchedUserId,
  filter,
  searchedUserRole,
  userRole,
}) {
  // Pass the dynamic searchedUserRole down through your generator function
  const filters = filterTabs({
    userRole,
    searchedUserId,
    searchedUserRole,
  });

  // Security layer: If a student lands here, hide the entire navigation filter block
  if (userRole === "student") return null;

  return (
    <div className="w-full mt-2">
      <ul className="flex gap-1 bg-white border border-stone-200 shadow-sm rounded-lg py-2 px-4 overflow-x-auto">
        {filters.map((f) => (
          <li key={f.value}>
            <Link
              href={f.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                f.value === filter
                  ? "bg-primary-500 shadow-sm text-white"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              {f.icon}
              {f.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchedUserFilter;
