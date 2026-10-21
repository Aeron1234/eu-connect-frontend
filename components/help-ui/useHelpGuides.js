"use client";

import { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { roleNames, roleGuides, sharedGuides } from "./helpContent";

export default function useHelpGuides() {
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
      { title: "Shared tools and account", guides: sharedGuides.filter((guide) =>
        (!guide.studentOnly || role === "student") && (!guide.hideForEmployer || role !== "employer")) },
    ];
  }, [role, isRegistrar]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = sections.map((section) => ({
    ...section,
    guides: section.guides.filter((guide) =>
      !normalizedQuery || [guide.title, guide.summary, ...guide.steps].join(" ").toLowerCase().includes(normalizedQuery)
    ),
  })).filter((section) => section.guides.length);

  return { query, setQuery, role, accountHref, visibleSections };
}
