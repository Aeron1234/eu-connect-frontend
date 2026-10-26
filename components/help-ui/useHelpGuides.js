"use client";

import { useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { getHelpSections } from "./helpContent";

// Build role-aware help/search state from the shared guide definitions.
// Return visible sections and account link without fetching a separate manual copy.
export default function useHelpGuides() {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const role = user?.role;
  const accountHref = `/${role}/account`;
  const sections = useMemo(() => getHelpSections(user), [user]);
  const normalizedQuery = query.trim().toLowerCase();
  // Search only guides already allowed for this user, matching title/summary/steps.
  // Remove sections with no matches without changing the underlying guide definitions.
  const visibleSections = sections.map(section => ({
    ...section,
    guides: section.guides.filter(guide =>
      !normalizedQuery || [guide.title, guide.summary, ...guide.steps].join(" ").toLowerCase().includes(normalizedQuery)),
  })).filter(section => section.guides.length);

  return { query, setQuery, role, accountHref, visibleSections };
}
