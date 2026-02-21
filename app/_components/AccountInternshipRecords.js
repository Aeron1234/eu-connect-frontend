"use client";

import Link from "next/link";

function AccountInternshipRecords() {
  return (
    <div className="text-xs flex flex-col gap-2 rounded-md">
      <ul className="flex-1 grid grid-cols-4 gap-4 justify-items-start wrap-break-word h-full">
        <li className="flex w-full font-semibold">
          <InternshipRecordCard />
        </li>
      </ul>
    </div>
  );
}

function InternshipRecordCard() {
  return (
    <div className="flex flex-col gap-4 bg-white w-full rounded-sm p-4 shadow-sm">
      <div className="text-center flex-1">
        <h4 className="text-sm font-extrabold text-primary-500">ABC Company</h4>
      </div>

      <div className="flex flex-col gap-2">
        <Detail label={"Status"} value={"Ongoing"} />
        <Detail label={"Date Started"} value={"01/01/2026"} />
        <Detail label={"Hours of Progress"} value={"100 / 200"} />
        <Detail
          label={"Company adress"}
          value={"123 Main Street, Makati City, Manila"}
        />
      </div>

      <Link
        href={""}
        className="w-full text-center transition-colors cursor-pointer text-sm bg-primary-500 rounded-full px-2 py-1 text-white"
      >
        See full details
      </Link>
    </div>
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
