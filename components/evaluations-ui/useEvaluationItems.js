"use client";

import { useEffect, useState } from "react";

export default function useEvaluationItems(evaluations) {
  const [items, setItems] = useState(evaluations);

  // Re-sync if the parent ever hands us a genuinely new list (real refresh,
  // tab switch fetching new data, etc.)
  useEffect(() => {
    setItems(evaluations);
  }, [evaluations]);

  function removeItem(id) {
    setItems((prev) => prev.filter((ev) => ev.id !== id));
  }

  function restoreItem(ev) {
    setItems((prev) => [ev, ...prev]);
  }
  return { items, removeItem, restoreItem };
}
