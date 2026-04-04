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
        loading: <Loader2Icon className="size-4 animate-spin text-stone-600" />,
      }}
      style={{
        "--normal-bg": "#fff",
        "--normal-text": "#292524",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)",
        "--success-bg": "#DCFCE7",
        "--success-text": "#166534",
        "--success-border": "#4ADE80",
        "--error-bg": "#FEE2E2",
        "--error-text": "#991B1B",
        "--error-border": "#FCA5A5",
      }}
      {...props}
    />
  );
};

export { Toaster };
