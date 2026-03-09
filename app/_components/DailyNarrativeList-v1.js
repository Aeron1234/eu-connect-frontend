"use client";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";

import DailyNarrativeContent from "./DailyNarrativeContent";
import { useState } from "react";
import { getDailyNarratives } from "../_services/services";
import DailyNarrativeDropdown from "./DailyNarrativeDropdown";
import TriggerButton from "./TriggerButton";

function DailyNarrativeList({ initialData, totalPages }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [narratives, setNarratives] = useState(initialData);

  const handlePageChange = async (newPage) => {
    setCurrentPage(newPage);
    const result = await getDailyNarratives(newPage, 2); // 2 cards per page
    setNarratives(result.narratives);
  };

  return (
    <>
      <ul className="flex-1 border border-stone-200 grid grid-cols-2">
        {narratives.map((narrative) => (
          <li
            className="flex flex-col gap-2 border-r border-stone-200 p-2"
            key={narrative.id}
          >
            <Narrative narrative={narrative} />
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-center gap-4 font-semibold px-4 py-2">
        <button
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

function Narrative({ narrative }) {
  const narrativeText =
    narrative.narrative.length >= 500
      ? narrative.narrative.split(" ").slice(0, 55).join(" ") + "..."
      : narrative.narrative;

  return (
    <>
      <header className="flex gap-1 items-center justify-between">
        <h3 className="font-bold text-stone-500 text-xs">
          Day {narrative.day_number}
        </h3>

        <DailyNarrativeDropdown
          trigger={<TriggerButton icon={<Ellipsis size={18} />} type="mini" />}
          narrative={narrative}
          isTextLong={narrative.narrative.length >= 500}
        />
      </header>

      <span className="font-bold">{narrative.title}</span>

      <p className="text-sm h-full max-h-45 overflow-auto">{narrativeText}</p>
    </>
  );
}

export default DailyNarrativeList;
