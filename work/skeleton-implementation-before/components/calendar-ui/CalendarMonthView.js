"use client";

import CalendarMonthNavigation from "./CalendarMonthNavigation";
import CalendarKindFilters from "./CalendarKindFilters";
import CalendarMonthGrid from "./CalendarMonthGrid";

export default function CalendarMonthView({
  month,
  moveMonth,
  pickDay,
  activeKinds,
  visible,
  setVisible,
  loading,
  dates,
  data,
  selected,
  visibleKinds,
}) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      aria-label="Monthly calendar"
    >
      <CalendarMonthNavigation
        month={month}
        moveMonth={moveMonth}
        pickDay={pickDay}
      />
      <CalendarKindFilters
        activeKinds={activeKinds}
        visible={visible}
        setVisible={setVisible}
      />
      {loading && <div
          className="h-1 w-full animate-pulse bg-primary"
          role="status"
          aria-label="Loading calendar"
        />}
      <CalendarMonthGrid
        dates={dates}
        month={month}
        data={data}
        selected={selected}
        visibleKinds={visibleKinds}
        pickDay={pickDay}
      />
    </section>
  );
}
