"use client";

import { useEffect, useRef, useState } from "react";
import NarrativeRotations from "./NarrativeRotations";
import Modal from "../ui/Modal";
import { formatNarrativeRange } from "@/lib/weekly-narrative-dates.mjs";

export default function NarrativePreview({ narrative }) {
  const previewRef = useRef(null);
  const [isClipped, setIsClipped] = useState(false);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return;

    let cancelled = false;
    const measure = () => {
      if (!cancelled) setIsClipped(preview.scrollHeight > preview.clientHeight + 1);
    };
    const frame = requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);
    observer.observe(preview);
    // A loaded font can change wrapping without changing the clamped box size.
    document.fonts?.ready.then(measure);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [narrative.narrative]);

  return (
    <>
      <p
        ref={previewRef}
        className="mt-3 line-clamp-3 break-words whitespace-pre-wrap text-sm leading-relaxed text-foreground-soft"
      >
        {narrative.narrative}
      </p>
      {isClipped && (
        <Modal
          title={narrative.title || "Untitled"}
          description={`${formatNarrativeRange(narrative.date_from, narrative.date_to) || "Date range not set"} · Week ${narrative.week_number}`}
          trigger={<span>See more &rarr;</span>}
          triggerStyles="mt-2 block w-fit text-left text-xs font-semibold text-primary-emphasis hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <NarrativeRotations narrative={narrative} />
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">
            {narrative.narrative}
          </p>
        </Modal>
      )}
    </>
  );
}
