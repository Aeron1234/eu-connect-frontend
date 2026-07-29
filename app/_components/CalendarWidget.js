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

  const monthName = currentDate.toLocaleString("default", { month: "long" });

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
    <div className="w-full max-w-sm bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-bold text-slate-800 tracking-tight">
          {monthName} {year}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider py-2"
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          const isToday = day && isSameMonth && day === today;

          return (
            <div key={i} className="flex items-center justify-center">
              <div
                className={`
                  w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all
                  ${!day ? "pointer-events-none" : ""}
                  ${
                    isToday
                      ? "bg-primary-500 text-white font-bold"
                      : "text-slate-600"
                  }
                `}
              >
                {day || ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;
