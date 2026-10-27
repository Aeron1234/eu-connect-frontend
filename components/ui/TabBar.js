"use client";

import Link from "next/link";
import {
  Building2,
  Repeat2,
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
  CheckCircle2,
  XCircle,
  ClipboardList,
  FolderOpen,
} from "lucide-react";

const iconMap = {
  overview: Building2,
  rotations: Repeat2,
  dtr: Clock,
  narratives: FileText,
  "summary-report": ClipboardList,
  evaluations: Star,
  certificates: FileCheck,
  info: User,
  "evaluate-supervisor": ClipboardCheck,
  "pending-confirmation": Hourglass,
  "past-evaluations": History,
  disputed: AlertTriangle,
  all: LayoutGrid,
  pending: Hourglass,
  ongoing: Clock,
  finished: CheckCircle2,
  rejected: XCircle,
  "annex-c": FileText,
  "annex-d": ClipboardCheck,
  form: FileText,
  reports: ClipboardList,
  documents: FolderOpen,
};

// `onSelect` (click-based, e.g. client-state tabs) and `getHref` (Link-based,
// e.g. URL-driven filters) are mutually exclusive — pass exactly one.
// `getBadge(tab)` is optional and renders a small count pill next to the label.
// `t.shortText`, if provided on a tab, shows on mobile instead of the icon
// falling back to icon-only; `t.text` always shows at sm+.
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
            {!t.shortText && <Icon className="w-4 h-4 shrink-0" />}
            {t.shortText ? (
              <>
                <span className="sm:hidden">{t.shortText}</span>
                <span className="hidden sm:inline">{t.text}</span>
              </>
            ) : (
              <span className="hidden sm:inline">{t.text}</span>
            )}
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
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-foreground-soft hover:bg-muted"
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
