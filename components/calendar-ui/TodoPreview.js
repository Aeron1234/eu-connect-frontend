"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";

export default function TodoPreview({ title, done }) {
  const previewRef = useRef(null);
  const [isClipped, setIsClipped] = useState(false);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    const measure = () => setIsClipped(preview.scrollHeight > preview.clientHeight + 1);
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(preview);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [title]);

  return (
    <div className="min-w-0 flex-1">
      <span
        ref={previewRef}
        className={`line-clamp-1 min-w-0 break-words text-[11px] font-medium sm:line-clamp-2 sm:text-sm sm:font-semibold ${done ? "line-through opacity-65" : ""}`}
      >
        {title}
      </span>
      {isClipped && (
      <Modal
          title="To-do"
          trigger={<span>See more &rarr;</span>}
          triggerStyles="mt-1 text-left text-xs font-semibold text-primary-emphasis hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {title}
          </p>
        </Modal>
    )}
    </div>
  );
}
