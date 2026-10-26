"use client";
import { createContext, useContext, useRef, useState } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Keep the sidebar's scroll position for this provider lifetime without rerendering
  // on every scroll. It is separate from the page content's scroll position.
  const navigationScrollRef = useRef(0);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);
  const closeMobile = () => setIsMobileOpen(false);
  // Reset both desktop/mobile state and the remembered navigation offset together.
  const resetSidebar = () => {
    setIsCollapsed(false);
    setIsMobileOpen(false);
    navigationScrollRef.current = 0;
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleCollapsed,
        isMobileOpen,
        toggleMobile,
        closeMobile,
        resetSidebar,
        navigationScrollRef,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within a SidebarProvider");
  return ctx;
}
