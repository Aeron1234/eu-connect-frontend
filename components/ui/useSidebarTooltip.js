"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Return event bindings plus a portal tooltip for collapsed desktop navigation.
// Coordinates are viewport-relative; scrolling or resizing dismisses a stale position.
export default function useSidebarTooltip(label, isCollapsed) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!position) return;

    const dismiss = () => setPosition(null);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [position]);

  function show(event) {
    if (!isCollapsed || !window.matchMedia("(min-width: 1024px)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const sidebarEdge = event.currentTarget.closest("aside")?.getBoundingClientRect().right;
    setPosition({ left: (sidebarEdge ?? bounds.right) + 6, top: bounds.top + bounds.height / 2 });
  }

  const bind = {
    onMouseEnter: show,
    onMouseLeave: () => setPosition(null),
    onFocus: show,
    onBlur: () => setPosition(null),
  };

  const tooltip = position && isCollapsed && createPortal(
    <span
      role="tooltip"
      className="pointer-events-none fixed z-[100] hidden -translate-y-1/2 whitespace-nowrap rounded-r-xl rounded-l-md bg-white px-4 py-2 text-xs font-semibold text-primary shadow-lg ring-1 ring-primary/20 dark:bg-primary dark:text-white dark:ring-white/20 lg:block"
      style={position}
    >
      {label}
    </span>,
    document.body,
  );

  return { bind, tooltip };
}
