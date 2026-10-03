"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

function ThemeToggle({ className = "" }) {
  const { setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() =>
        setTheme(
          document.documentElement.classList.contains("dark")
            ? "light"
            : "dark",
        )
      }
      className={`inline-flex size-11 items-center justify-center rounded-lg text-foreground-soft transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <Moon className="size-5 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-5 dark:block" aria-hidden="true" />
    </button>
  );
}

export default ThemeToggle;
