"use client";

import InternshipRecordList from "./InternshipRecordList";

function InternshipRecords({ userInternshipData }) {
  return (
    <>
      <div className="flex flex-col">
        <h2 className="text-base font-semibold flex items-center">
          My Records
        </h2>
        {userInternshipData.length > 0 && (
          <p className="text-sm text-stone-600">{`${userInternshipData.length} total records`}</p>
        )}
      </div>

      <InternshipRecordList userInternshipData={userInternshipData} />
    </>
  );
}

export default InternshipRecords;
