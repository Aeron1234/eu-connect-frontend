"use client";

import { Clock, FileCheck, FileText, Star, User } from "lucide-react";

const iconMap = {
  dtr: Clock,
  narratives: FileText,
  evaluations: Star,
  certificates: FileCheck,
  info: User,
};

function SearchedUserFilter({ tabs, selectedTab, onSelect }) {
  // Nothing to switch between — e.g. a student viewing another profile,
  // or an employer profile with no tabs beyond Info.
  if (tabs.length <= 1) return null;

  return (
    <div className="w-full rounded-xl border border-stone-300 bg-white shadow-sm p-1.5">
      <ul className="flex gap-1 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = iconMap[t.value] || User;
          return (
            <li key={t.value}>
              <button
                type="button"
                onClick={() => onSelect(t.value)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                  t.value === selectedTab
                    ? "bg-primary-500 text-primary-foreground shadow-sm"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default SearchedUserFilter;
