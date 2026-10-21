"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function MapCompanySlideout({ open, companyId, onClose, returnFocusRef, children }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open, companyId]);

  function close() {
    onClose();
    returnFocusRef.current?.focus({ preventScroll: true });
  }

  return (
    <section
      aria-label="Company details"
      aria-hidden={!open}
      inert={!open}
      onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }}
      className={`absolute inset-y-0 left-0 z-10 hidden w-[calc(100%-3rem)] max-w-sm flex-col border-r border-border bg-card text-foreground transition-transform duration-250 ease-out motion-reduce:transition-none lg:flex ${open ? "translate-x-0 shadow-xl" : "pointer-events-none -translate-x-full"}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Company details</h2>
        <button ref={closeRef} type="button" onClick={close} aria-label="Close company details" className="inline-flex size-9 items-center justify-center rounded-lg border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <X className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
    </section>
  );
}
