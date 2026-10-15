"use client";

import ManualDialog from "@/components/ui/ManualDialog";

export default function CalendarHelp({ role }) {
  return (
    <ManualDialog title="How to use the calendar">
      <div className="space-y-4 text-sm leading-relaxed text-foreground">
        <ol className="list-decimal space-y-3 pl-5 marker:font-semibold marker:text-primary-emphasis">
          <li>
            {"Use the arrows to change months or "}
            <strong>
              Today
            </strong>
            {" to return to the current date. Select a day to see its announcements, schedules, and other details in the day agenda below."}
          </li>
          <li>
            Use the checkboxes above the calendar to show or hide each type of item. Colored dots mark days with items; on larger screens, you can see a preview in each day.
          </li>
          <li>
            Announcements and schedules with a date range appear on every included day. Short bars mark multi-day items on small screens; arrows show their start, continuation, and end on larger screens. Select a day to read the full date range in its agenda.
          </li>
          {role === "student" ? (
                        <>
              <li>
                {"Choose a day within your ongoing internship dates, then select "}
                <strong>
                  Add to-do
                </strong>
                . Enter a task title and save it. Your to-dos are private to you.
              </li>
              <li>
                In the day agenda, use the checkmark to complete or reopen a to-do. Use the pencil to edit it, or the trash icon to delete it after confirmation.
              </li>
            </>
                      ) : (
                        <>
              <li>
                {"Select the date, then choose "}
                <strong>
                  Add schedule
                </strong>
                {". Enter a title, optional details, and the start and end dates. Select "}
                <strong>
                  Publish schedule
                </strong>
                {" to save it and notify students."}
              </li>
              <li>
                {"Open a scheduled day in the agenda to edit or delete a schedule you created. "}
                {role === "admin" ? "As an admin, you can also manage other schedules." : "Only your own schedules can be changed."}
              </li>
            </>
                      )}
        </ol>
      </div>
    </ManualDialog>
  );
}
