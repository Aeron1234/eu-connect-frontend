"use client";

import { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { getHelpSections } from "./helpContent";

export default function useHelpGuides() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const role = user?.role;
  const accountHref = `/${role}/account`;
  const sections = useMemo(() => getHelpSections(user), [user]);
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = sections.map(section => ({
    ...section,
    guides: section.guides.filter(guide =>
      !normalizedQuery || [guide.title, guide.summary, ...guide.steps].join(" ").toLowerCase().includes(normalizedQuery)),
  })).filter(section => section.guides.length);

  return { query, setQuery, role, accountHref, visibleSections };
}
