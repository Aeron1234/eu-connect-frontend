import DtrButton from "@/app/_components/DtrButton";
import DtrTable from "@/app/_components/DtrTable";
import {
  getLatestDtrStatus,
  getOngoingInternshipRecord,
} from "@/app/_services/services";
import { getDtrs } from "@/app/_services/student-actions";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

async function DtrPage({ searchParams }) {
  const params = await searchParams;
  const currentDtrPage = Number(params.d_page) || 1;
  const currentNarrativePage = Number(params.n_page) || 1;

  const [internshipData, dtrData, dtrStatus] = await Promise.all([
    getOngoingInternshipRecord(),
    getDtrs(currentDtrPage),
    getLatestDtrStatus(),
  ]);

  console.log(dtrData);
  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-base font-semibold text-stone-700 max-sm:text-sm">
          Daily Time Record
        </h2>

        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <DtrButton
            internshipData={internshipData}
            status={dtrStatus?.status}
          />
        </Suspense>
      </div>

      <div className="flex-1 flex flex-col relative gap-4 justify-between">
        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <DtrTable
            dtrs={dtrData?.dtrs}
            totalPages={dtrData?.totalPages}
            currentDtrPage={currentDtrPage}
            currentNarrativePage={currentNarrativePage}
          />
        </Suspense>
      </div>
    </>
  );
}

export default DtrPage;
