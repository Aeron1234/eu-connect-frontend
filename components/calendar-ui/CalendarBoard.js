"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import useCalendarBoard from "./useCalendarBoard";
import CalendarBoardHeader from "./CalendarBoardHeader";
import CalendarMonthView from "./CalendarMonthView";
import CalendarAgenda from "./CalendarAgenda";
import CalendarOverview from "./CalendarOverview";
import CalendarEditorDialog from "./CalendarEditorDialog";

function CalendarBoard({ initialDate, initialData }) {
  const {
    monthQuery, headerProps, monthProps, agendaProps,
    overviewProps, editorProps, confirmationProps,
  } = useCalendarBoard({ initialDate, initialData });

  if (monthQuery.isError && !monthQuery.data) {
    return (
      <ErrorUI
        error={monthQuery.error}
        reset={() => void monthQuery.refetch()}
        logError={false}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1680px] p-3 pb-12 sm:p-6 lg:p-8">
      <CalendarBoardHeader {...headerProps} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
        <div className="min-w-0 space-y-4">
          <CalendarMonthView {...monthProps} />
          <CalendarAgenda {...agendaProps} />
        </div>
        <CalendarOverview {...overviewProps} />
      </div>
      <ConfirmDialog {...confirmationProps} />
      <CalendarEditorDialog {...editorProps} />
    </div>
  );
}

export default CalendarBoard;
