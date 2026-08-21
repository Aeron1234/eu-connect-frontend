"use client";

import { Badge, ChevronDown, Clock } from "lucide-react";
import Link from "next/link";

function AccountInternshipRecords() {
  return (
    <>
      <li className="flex w-full font-semibold rounded-sm border">
        <InternshipRecordCard />
      </li>
      <li className="flex w-full font-semibold rounded-sm border">
        <InternshipRecordCard />
      </li>
      <li className="flex w-full font-semibold rounded-sm border">
        <InternshipRecordCard />
      </li>
    </>
  );
}

function InternshipRecordCard() {
  return (
    <button
      // onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id)}
      className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-red-100 text-primary-500`}
          // className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
          //       ${
          //         record.status === "ongoing" ? "bg-primary/10 text-primary" : "bg-green-500/10 text-green-600"
          //       }`}
        >
          {/* {record.status === "ongoing" ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )} */}

          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {/* {record.company} */}
            ABC Company
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {/* {record.position} */}
            Junior Developer
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span
          // variant={record.status === "ongoing" ? "default" : "secondary"}

          className="text-xs hidden sm:inline-flex bg-primary-500 text-white rounded-full px-3 py-1"
        >
          {/* {record.status === "ongoing" ? "Ongoing" : "Completed"} */}
          Ongoing
        </span>
        {/* {expandedRecord === record.id ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )} */}
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-stone-500">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

export default AccountInternshipRecords;
