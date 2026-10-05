"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function SidebarThemeSwitch({ isCollapsed }) {
  const { setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`flex w-full gap-1 rounded-full bg-black/15 p-1 dark:bg-white/5 ${isCollapsed ? "lg:flex-col" : ""}`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Light mode"
        className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full bg-white px-2 text-xs font-semibold text-primary shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-transparent dark:text-white/65 dark:shadow-none dark:hover:bg-white/10"
      >
        <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className={isCollapsed ? "lg:hidden" : ""}>Light</span>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Dark mode"
        className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full px-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-primary dark:text-white dark:shadow-sm"
      >
        <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className={isCollapsed ? "lg:hidden" : ""}>Dark</span>
      </button>
    </div>
  );
}

export default SidebarThemeSwitch;
