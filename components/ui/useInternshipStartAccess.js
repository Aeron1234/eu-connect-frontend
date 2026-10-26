"use client";

import { useEffect, useReducer } from "react";
import { getInternshipStartAccess } from "@/lib/internship-start.mjs";

// Refresh the UI at the unlock time and when the page regains focus/visibility.
// The backend independently enforces the start-date restriction.
export default function useInternshipStartAccess(dateStarted, feature) {
  const [, refresh] = useReducer(value => value + 1, 0);
  const access = getInternshipStartAccess(dateStarted, feature);

  useEffect(() => {
    let timer;
    function schedule() {
      window.clearTimeout(timer);
      if (access.unlockAt && access.unlockAt > Date.now()) {
        // Recheck just after midnight; cap distant dates at the browser's maximum delay.
        timer = window.setTimeout(update, Math.min(access.unlockAt - Date.now() + 25, 2_147_483_647));
      }
    }
    function update() {
      refresh();
      schedule();
    }
    schedule();
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [access.unlockAt]);

  return access;
}
