"use client";

import { MapPin } from "lucide-react";
import PageTitle from "../ui/PageTitle";
import StudentMapHelp from "./StudentMapHelp";

export default function StudentMapHeader({ tabs, tab, setTab }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <PageTitle
        Icon={MapPin}
        title={"Student Map"}
        description={
          "Showing all the interns and their company across the map."
        }
        titleAction={
          <StudentMapHelp />
        }
      />

      <div className="flex rounded-lg bg-secondary p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
              tab === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-primary-emphasis"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
