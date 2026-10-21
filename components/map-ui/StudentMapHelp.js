"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function StudentMapHelp() { return (
    <ManualDialog title="How to use the student map">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <p>Explore the current internship locations and students assigned to each company. On smaller screens, open <strong>Location</strong> or <strong>Recommendations</strong> below the filters to use the map tools without pushing the map down the page. The Recommended first visits section ranks cities by student count, with straight-line proximity breaking ties.</p>
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>Use the <strong>search box</strong> to find a student, company, or course. Choose a <strong>region</strong> to narrow the locations shown.</li>
          <li>In <strong>Map View</strong>, pan or zoom the map, then select a pin. The number on the pin shows how many interns are at that company.</li>
          <li>Read the selected company&apos;s details and each intern&apos;s progress in the panel beside the map. On smaller screens, selecting a pin slides the details in from the left. Close the panel to return to the map, or reopen it with the company Details button. Showing a road route closes the mobile panel so you can see the route.</li>
          <li>Switch to <strong>Cities</strong> to compare student counts across departments and see names grouped by city and company. Sort by most students, most companies, or city name. Select <strong>Show road route</strong> to display driving directions from the selected starting point, or use the Google Maps backup. Select <strong>Use my location</strong> to enable private live position updates and route from where you are, or keep Candelaria as the starting point.</li>
          <li>Switch to <strong>Companies</strong> to browse the same results as cards, with each company&apos;s interns and progress listed together.</li>
        </ol>
      </div>
    </ManualDialog>
  );
}
