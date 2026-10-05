"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import useSidebarTooltip from "./useSidebarTooltip";

function SidebarThemeSwitch({ isCollapsed }) {
  const { setTheme } = useTheme();
  const lightTooltip = useSidebarTooltip("Light mode", isCollapsed);
  const darkTooltip = useSidebarTooltip("Dark mode", isCollapsed);

  return (
    <div
      role="group"
      aria-label="Color theme"
      className={`flex w-full gap-1 rounded-full bg-black/15 p-1 dark:bg-white/5 ${isCollapsed ? "lg:flex-col" : ""}`}
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        title={isCollapsed ? undefined : "Light mode"}
        aria-label="Light mode"
        {...lightTooltip.bind}
        className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full bg-white px-2 text-xs font-semibold text-primary shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-transparent dark:text-white/65 dark:shadow-none dark:hover:bg-white/10"
      >
        <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className={isCollapsed ? "lg:hidden" : ""}>Light</span>
      </button>
      {lightTooltip.tooltip}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        title={isCollapsed ? undefined : "Dark mode"}
        aria-label="Dark mode"
        {...darkTooltip.bind}
        className="flex min-h-9 flex-1 items-center justify-center gap-2 rounded-full px-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white dark:bg-primary dark:text-white dark:shadow-sm"
      >
        <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className={isCollapsed ? "lg:hidden" : ""}>Dark</span>
      </button>
      {darkTooltip.tooltip}
    </div>
  );
}

export default SidebarThemeSwitch;
