"use client";

import Link from "next/link";
import {
  Clock,
  FileCheck,
  FileText,
  Star,
  User,
  ClipboardCheck,
  Hourglass,
  History,
  AlertTriangle,
  LayoutGrid,
  LayoutDashboard,
  Files,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";

const iconMap = {
  dtr: Clock,
  narratives: FileText,
  evaluations: Star,
  certificates: FileCheck,
  info: User,
  overview: LayoutDashboard,
  documents: Files,
  "evaluate-supervisor": ClipboardCheck,
  "pending-confirmation": Hourglass,
  "past-evaluations": History,
  disputed: AlertTriangle,
  all: LayoutGrid,
  pending: Hourglass,
  ongoing: Clock,
  finished: CheckCircle2,
  rejected: XCircle,
};

// `onSelect` (click-based, e.g. client-state tabs) and `getHref` (Link-based,
// e.g. URL-driven filters) are mutually exclusive — pass exactly one.
// `getBadge(tab)` is optional and renders a small count pill next to the label.
function TabBar({ tabs, selectedTab, onSelect, getHref, getBadge }) {
  // Nothing to switch between — e.g. a student viewing another profile,
  // or an employer profile with no tabs beyond Info.
  if (tabs.length <= 1) return null;

  return (
    <ul className="flex flex-wrap gap-1">
      {tabs.map((t) => {
        const Icon = iconMap[t.value] || User;
        const isActive = t.value === selectedTab;
        const badge = getBadge?.(t);

        const content = (
          <>
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{t.text}</span>
            {badge !== null && badge !== undefined && (
              <span
                className={`hidden sm:inline text-xs ${isActive ? "opacity-80" : "opacity-60"}`}
              >
                {badge}
              </span>
            )}
          </>
        );

        const className = `flex w-full sm:w-auto items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
          isActive
            ? "bg-primary-500 text-primary-foreground shadow-sm"
            : "text-stone-600 hover:bg-stone-100"
        }`;

        return (
          <li key={t.value} className="flex-1 sm:flex-none">
            {getHref ? (
              <Link href={getHref(t)} title={t.text} className={className}>
                {content}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => onSelect(t.value)}
                title={t.text}
                className={className}
              >
                {content}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default TabBar;
