"use client";

import DtrTable from "../dtr-ui/DtrTable";
import DtrPagination from "../dtr-ui/DtrPagination";
import SetDtrLocation from "../dtr-ui/SetDtrLocation";
import normalizeDtrLocation from "../dtr-ui/normalizeDtrLocation";

export default function ProfileDtrTab({ data, dtrPage, setDtrPage, tabQuery, userRole, searchedUserId, handleDtrLocationSaved }) {
  return (
    <>
      <div className="min-w-0 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <DtrTable
          dtrs={data?.dtrData?.dtrs || []}
        />
        <DtrPagination
          page={dtrPage}
          totalPages={data?.dtrData?.totalPages}
          onPageChange={setDtrPage}
          disabled={tabQuery.isFetching}
        />
      </div>

      {["employer", "admin"].includes(userRole) && data?.dtrLocation?.internship_id && (
        <div className="mt-6">
          <SetDtrLocation
            studentId={searchedUserId}
            dataLocation={normalizeDtrLocation(data?.dtrLocation)}
            onSaved={handleDtrLocationSaved}
          />
        </div>
      )}
    </>
  );
}
