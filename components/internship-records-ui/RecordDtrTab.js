"use client";

import DtrTable from "../dtr-ui/DtrTable";
import DtrPagination from "../dtr-ui/DtrPagination";
import SetDtrLocation from "../dtr-ui/SetDtrLocation";
import normalizeDtrLocation from "../dtr-ui/normalizeDtrLocation";

export default function RecordDtrTab({ record, data, dtrPage, setDtrPage, tabQuery, handleDtrLocationSaved }) {
  return (
    <>
      <div className="min-w-0 rounded-xl bg-card border border-border shadow-sm p-4 sm:p-6">
        <DtrTable dtrs={data?.dtrData?.dtrs || []} />
        <DtrPagination
          page={dtrPage}
          totalPages={data?.dtrData?.totalPages}
          onPageChange={setDtrPage}
          disabled={tabQuery.isFetching}
        />
      </div>
      {record?.status === "ongoing" && (
        <div className="mt-6">
          <SetDtrLocation
            studentId={record?.student_id}
            dataLocation={normalizeDtrLocation(data?.dtrLocation)}
            onSaved={handleDtrLocationSaved}
          />
        </div>
      )}
    </>
  );
}
