"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const todayDate = new Date();
  const isSameMonth =
    currentDate.getMonth() === todayDate.getMonth() &&
    currentDate.getFullYear() === todayDate.getFullYear();

  const today = todayDate.getDate();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  // 🔥 Navigation handlers
  function handlePrevMonth() {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  }

  function handleNextMonth() {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="card-elevated p-4 bg-white rounded-sm shadow-sm max-sm:flex max-sm:flex-col">
      <div className="flex items-center justify-between mb-3 ">
        <button
          onClick={handlePrevMonth}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-bold text-primary-500">
          {monthName} {year}
        </h3>

        <button
          onClick={handleNextMonth}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs max-sm:h-full max-sm:gap-2">
        {DAYS.map((d) => (
          <div
            key={d}
            className="py-1 font-medium text-muted-foreground max-lg:p-1"
          >
            {d}
          </div>
        ))}

        {cells.map((day, i) => (
          <div
            key={i}
            className={`py-1 rounded-full text-sm cursor-pointer transition-colors max-xs:text-xs
              ${
                day && isSameMonth && day === today
                  ? "bg-primary-500 text-white font-semibold"
                  : day
                    ? "text-foreground hover:bg-muted"
                    : ""
              }`}
          >
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
