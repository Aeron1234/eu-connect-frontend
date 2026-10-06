"use client";

import { useEffect, useRef, useState } from "react";

function StickyHeaderSurface({ children }) {
  const headerRef = useRef(null);
  const [isOverlapping, setIsOverlapping] = useState(false);

  useEffect(() => {
    const scrollContainer = headerRef.current?.parentElement;
    if (!scrollContainer) return;

    const updateSurface = () => {
      setIsOverlapping(scrollContainer.scrollTop > 0);
    };

    updateSurface();
    scrollContainer.addEventListener("scroll", updateSurface, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", updateSurface);
  }, []);

  return (
    <div
      ref={headerRef}
      className={`sticky top-0 z-30 flex h-16 w-full items-center border-b border-border/70 px-4 py-1 text-foreground transition-[background-color,backdrop-filter] duration-200 sm:px-6 lg:px-8 ${
        isOverlapping ? "bg-canvas/80 backdrop-blur-2xl" : "bg-canvas"
      }`}
    >
      {children}
    </div>
  );
}

export default StickyHeaderSurface;
