import DtrTable from "@/app/_components/DtrTable";
import DtrTodayCard from "@/app/_components/DtrTodayCard";
import {
  getDtrToday,
  getLatestDtrStatus,
  getOngoingInternshipRecord,
} from "@/app/_services/services";
import { getDtrs } from "@/app/_services/student-actions";

const timeRecords = [
  {
    date: "Jul 6, 2026",
    timeIn: "8:02 AM",
    timeOut: "5:08 PM",
    hours: "9.1h",
    status: "Present",
  },
  {
    date: "Jul 5, 2026",
    timeIn: "7:58 AM",
    timeOut: "5:00 PM",
    hours: "9h",
    status: "Present",
  },
  {
    date: "Jul 4, 2026",
    timeIn: "8:05 AM",
    timeOut: "12:00 PM",
    hours: "3.9h",
    status: "Half Day",
  },
  {
    date: "Jul 3, 2026",
    timeIn: "—",
    timeOut: "—",
    hours: "—",
    status: "Absent",
  },
  {
    date: "Jul 2, 2026",
    timeIn: "8:00 AM",
    timeOut: "5:15 PM",
    hours: "9.3h",
    status: "Present",
  },
];

async function DtrPage({ searchParams }) {
  const params = await searchParams;
  const currentDtrPage = Number(params.d_page) || 1;
  const currentNarrativePage = Number(params.n_page) || 1;

  const [internshipData, dtrData, dtrStatus, dtrToday] = await Promise.all([
    getOngoingInternshipRecord(),
    getDtrs(currentDtrPage),
    getLatestDtrStatus(),
    getDtrToday(),
  ]);

  return (
    <>
      {/* Today card */}

      <DtrTodayCard
        internshipData={internshipData}
        status={dtrStatus?.status}
        dtrToday={dtrToday}
      />

      <section className="rounded-xl bg-white border border-stone-300 shadow-sm p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-4">
          <span className="w-4 h-4 rounded-full border-2 border-primary-500 flex-shrink-0" />
          Recent Time Records
        </h3>
        <div className="overflow-x-auto">
          <DtrTable
            // dtrs={timeRecords}
            dtrs={dtrData?.dtrs || []}
            totalPages={dtrData?.totalPages}
            currentDtrPage={currentDtrPage}
            currentNarrativePage={currentNarrativePage}
          />
        </div>
      </section>
    </>
  );
}

function Records() {
  return;
}

export default DtrPage;
