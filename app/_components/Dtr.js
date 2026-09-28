import { getDtrs } from "@/lib/server-actions/dtr-actions";
import DtrButton from "./DtrButton";
import DtrTable from "./DtrTable";

async function Dtr() {
  const dtrData = await getDtrs();

  if (!dtrData?.dtrs)
    return (
      <div className="flex justify-center w-full h-full">
        <span className="text-stone-400 text-base">No existing record</span>
      </div>
    );

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-stone-700">
          Your Daily Time Record
        </h2>

        <DtrButton />
      </div>

      <div className="overflow-y-scroll w-full overflow-x-scroll flex flex-col relative">
        <DtrTable dtrData={dtrData.dtrs} />
      </div>
    </>
  );
}

export default Dtr;
