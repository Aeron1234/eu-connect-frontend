import { Search } from "lucide-react";

function UsersSearchBar({ inputValue, setInputValue, loading = false }) {
  return (
    <div className="w-full flex items-center gap-4 mb-6 relative">
      <div className="flex-1 flex items-center gap-2 border border-stone-200 bg-white rounded-lg px-2">
        <Search className="w-4 h-4" />
        <input
          placeholder="Search by name, course, or company..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full p-2 outline-0"
        />
      </div>
      {/* <select
        // value={filterDept}
        // onChange={(e) => setFilterDept(e.target.value)}
        className="px-3 py-2 rounded-sm border bg-card text-sm"
      ></select> */}

      {loading && (
        <div className="absolute top-full left-0 w-full h-full bg-white border border-stone-200 shadow-lg flex items-center justify-center rounded-lg">
          <span className="">Searching...</span>
        </div>
      )}
    </div>
  );
}

export default UsersSearchBar;
