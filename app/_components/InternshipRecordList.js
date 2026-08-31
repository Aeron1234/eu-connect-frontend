"use client";

import { useState } from "react";
import CustomToolTip from "./CustomToolTip";
import { format } from "date-fns";
import {
  Calendar,
  CircleCheck,
  Clock,
  LoaderCircle,
  MapPin,
  Trash2,
} from "lucide-react";

function InternshipRecordList({ userInternshipData }) {
  if (userInternshipData.length === 0) return null;

  console.log(userInternshipData);

  return (
    <ul className="flex-1 flex flex-col gap-4">
      {userInternshipData.map((record) => (
        <li key={record.id} className="">
          <Record record={record} />
        </li>
      ))}
    </ul>
  );
}

function Record({ record }) {
  const {
    id,
    created_at,
    company_name,
    company_address,
    status,
    internship_position,
    description,
    company_website,
    date_started,
    date_ended,
    total_hours,
    first_name,
    last_name,
    course_name,
    short_name,
  } = record;

  return (
    <div className="flex-1 flex gap-4 border border-stone-300 p-4 rounded-lg">
      <div className="flex-1 flex flex-col gap-1 text-stone-500">
        <div className="mb-1 flex flex-col">
          <div className="flex gap-2 items-center">
            <h3 className="font-semibold text-stone-800">{company_name}</h3>
            <Tag status={status} />
          </div>
          <span className="text-xs">{internship_position}</span>
        </div>
        <div className="flex items-center gap-1 text-stone-500 text-xs">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(date_started), "MM/dd/yyyy")}
          </span>
          &mdash;
          {date_ended && (
            <span className="flex items-center gap-1">
              {format(new Date(date_ended), "MM/dd/yyyy")}
            </span>
          )}
        </div>

        <p className="text-xs flex items-center gap-1">
          <span>
            <Clock className="h-3 w-3" />
          </span>
          {total_hours} hrs required
        </p>

        <p className="text-xs flex items-center gap-1">
          <span>
            <MapPin className="h-3 w-3" />
          </span>
          {company_address}
        </p>

        <p className="text-xs">Job Description: {description}</p>

        {company_website && (
          <p className="text-xs flex items-center gap-1">
            Company Website:
            <a
              className="text-xs underline"
              href={`https://${company_website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {company_website}
            </a>
          </p>
        )}
      </div>

      <div
        className="relative cursor-pointer p-2 self-center hover:bg-red-200 hover:text-primary-500 rounded-sm transition-colors"
        title="Delete record"
      >
        <Trash2 className="h-5 w-5" />
      </div>
    </div>
  );
}

function Tag({ status }) {
  if (status === "pending") {
    return (
      <div className="text-[10px] flex items-center gap-1 text-yellow-900 bg-yellow-100 w-fit px-2 py-0.5 rounded-full tracking-wider font-bold">
        <span>
          <Clock className="h-3 w-3" />
        </span>
        {status}
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="text-[10px] flex items-center gap-1 text-stone-800 bg-stone-100 w-fit px-2 py-0.5 rounded-full tracking-wider font-bold">
        <span>
          <Clock className="h-3 w-3" />
        </span>
        {status}
      </div>
    );
  }

  if (status === "ongoing") {
    return (
      <div className="text-[10px] flex items-center gap-1 text-blue-900 bg-blue-100 w-fit px-2 py-0.5 rounded-full tracking-wider font-bold">
        <span>
          <LoaderCircle className="h-3 w-3" />
        </span>
        {status}
      </div>
    );
  }

  if (status === "finished") {
    return (
      <div className="text-[10px] flex items-center gap-1 text-green-900 bg-green-100 w-fit px-2 py-0.5 rounded-full tracking-wider font-bold">
        <span>
          <CircleCheck className="h-3 w-3" />
        </span>
        {status}
      </div>
    );
  }
}

export default InternshipRecordList;
