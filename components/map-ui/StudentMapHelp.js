"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function StudentMapHelp() { return (
    <ManualDialog title="How to use the student map">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>Explore the current internship locations and students assigned to each company.</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>Use the <strong>search box</strong> to find a student, company, or course. Choose a <strong>region</strong> to narrow the locations shown.</li>
          <li>In <strong>Map View</strong>, pan or zoom the map, then select a pin. The number on the pin shows how many interns are at that company.</li>
          <li>Read the selected company&apos;s details and each intern&apos;s progress in the panel beside or below the map. Select another pin to switch companies.</li>
          <li>Switch to <strong>Companies</strong> to browse the same results as cards, with each company&apos;s interns and progress listed together.</li>
        </ol>
      </div>
    </ManualDialog>
  );
}
