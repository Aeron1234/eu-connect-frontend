import DtrButton from "@/app/_components/DtrButton";
import DtrTable from "@/app/_components/DtrTable";
import { getDtrs } from "@/app/_services/actions";

async function DtrPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <div className="flex justify-between">
        <h2 className="text-base font-semibold text-stone-700">
          Daily Time Record
        </h2>

        <DtrButton />
      </div>

      <div className="w-full flex flex-col relative gap-4 justify-between">
        <DtrTable params={params} />
      </div>
    </>
  );
}

export default DtrPage;
