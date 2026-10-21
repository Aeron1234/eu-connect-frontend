import { Briefcase, FileUp, UserRound, MoreHorizontal } from "lucide-react";
import Link from "next/link";

const actions = [
  { label: "Post a new job", icon: Briefcase, href: "/internships" },
  {
    label: "Upload intern document",
    icon: FileUp,
    href: "/users",
  },
  {
    label: "Manage my account",
    icon: UserRound,
    href: "/employer/account",
  },
];

function QuickActionsCard() {
  return (
    <div className="rounded-xl bg-primary text-white p-5">
      <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <a.icon className="w-4 h-4" />
              {a.label}
            </span>
            <MoreHorizontal className="w-4 h-4 opacity-70" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickActionsCard;
