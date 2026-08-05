import DtrTable from "@/app/_components/DtrTable";
import DtrTodayCard from "@/app/_components/DtrTodayCard";
import {
  getDtrToday,
  getLatestDtrStatus,
  getOngoingInternshipRecord,
} from "@/app/_services/services";
import { getDtrs } from "@/app/_services/student-actions";

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
