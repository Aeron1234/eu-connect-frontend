import InternshipRecordForm from "@/app/_components/InternshipRecordForm";
import InternshipRecords from "@/app/_components/InternshipRecords";
import SpinnerBig from "@/app/_components/SpinnerBig";
import {
  getInternshipRecords,
  getOngoingInternshipRecord,
  getRegions,
} from "@/app/_services/services";
import { Briefcase } from "lucide-react";
import { Suspense } from "react";

export const metadata = {
  title: "Internship Records",
};

async function InternshipRecordPage({ searchParams }) {
  const [userInternshipData, regions, recordStatus] = await Promise.all([
    getInternshipRecords(),
    getRegions(),
    getOngoingInternshipRecord(),
  ]);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto flex flex-col gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-primary-500" />
          My Records
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Submit your internship details and track approval status
        </p>
      </div>

      <div className="rounded-xl border border-stone-300 bg-white shadow-sm py-4 px-8 flex flex-col gap-4 transition duration-700 ease-in-out">
        <Suspense fallback={<SpinnerBig />}>
          <InternshipRecordForm
            regions={regions || []}
            recordStatus={recordStatus?.status}
          />
        </Suspense>
      </div>

      <div className="rounded-xl flex-1 py-4 px-8 flex flex-col gap-4 border border-stone-300 bg-white shadow-sm ">
        <Suspense fallback={<SpinnerBig />}>
          <InternshipRecords userInternshipData={userInternshipData} />
        </Suspense>
      </div>
    </main>
  );
}

export default InternshipRecordPage;
