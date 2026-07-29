import { ChevronDown, Plus } from "lucide-react";

function InternshipRecordFormHeader({ showForm, setShowForm }) {
  return (
    <div className="flex justify-between items-center gap-1">
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
          <span>
            <Plus className="h-5 w-5" />
          </span>
          New Internship Record
        </h2>
        <p className="text-sm text-stone-600">
          Provide your placement details for review by your department head
        </p>
      </div>

      <button
        className="flex gap-1 items-center py-1 px-2 rounded-sm cursor-pointer hover:text-primary-500 hover:bg-red-100 transition-all font-semibold"
        onClick={() => setShowForm((val) => !val)}
      >
        {showForm ? <span>Hide</span> : <span>Show</span>}

        <span className={`transition-all ${showForm ? "rotate-180" : ""}`}>
          <ChevronDown className="h-5 w-5" />
        </span>
      </button>
    </div>
  );
}

export default InternshipRecordFormHeader;
