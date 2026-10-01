"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-foreground-soft" />,
      }}
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
        "--success-bg": "var(--toast-success-bg)",
        "--success-text": "var(--toast-success-text)",
        "--success-border": "var(--toast-success-border)",
        "--error-bg": "var(--toast-error-bg)",
        "--error-text": "var(--toast-error-text)",
        "--error-border": "var(--toast-error-border)",
        "--warning-bg": "var(--toast-warning-bg)",
        "--warning-text": "var(--toast-warning-text)",
      }}
      {...props}
    />
  );
};

export { Toaster };
