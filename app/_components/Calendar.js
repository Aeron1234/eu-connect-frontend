"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function Calendar() {
  return (
    <div className="text-sm self-start w-full p-4 bg-primary-500 text-white rounded-md grid justify-center shadow-sm">
      <DayPicker
        animate
        navLayout="around"
        classNames={{
          today: "bg-primary-50 rounded-full text-primary-500 h-full w-full",
        }}
      />
    </div>
  );
}

export default Calendar;
