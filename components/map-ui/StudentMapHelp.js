"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function StudentMapHelp() { return (
    <ManualDialog title="How to use the student map">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>Explore the current internship locations and students assigned to each company. On smaller screens, open <strong>Location</strong> or <strong>Recommendations</strong> below the filters to use the map tools without pushing the map down the page. The Recommended first visits section ranks cities by student count, with straight-line proximity breaking ties.</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>Use the <strong>search box</strong> to find a student, company, or course. Choose a <strong>region</strong> to narrow the locations shown.</li>
          <li>In <strong>Map View</strong>, pan or zoom the map, then select a pin. The number on the pin shows how many interns are at that company.</li>
          <li>Selecting a pin slides company details and each intern&apos;s progress in from the map&apos;s left edge. On smaller screens, the details open in a left-side drawer. Use the small panel icon inside the map to reopen details. The panel stays open while a route loads or fails, and closes after a successful route. Reopen it to review the distance, travel time or Google Maps link.</li>
          <li>Use <strong>Visit by city</strong> beside the map (below it on smaller screens) to compare student counts across departments. Expand a city to see its companies and student names. Sort by most students, most companies, or city name. Select <strong>Show road route</strong> to display driving directions from the selected starting point, or use the Google Maps backup. Select <strong>Use my location</strong> to route from where you are, or keep Candelaria as the starting point.</li>
          <li>Switch to <strong>Companies</strong> to browse the same results as cards, with each company&apos;s interns and progress listed together.</li>
        </ol>
      </div>
    </ManualDialog>
  );
}
