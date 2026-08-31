import { UserX } from "lucide-react";

function SearchedUserEmpty({ query }) {
  return (
    <div className="w-full flex flex-col items-center gap-4 px-4 py-8 rounded-xl border border-stone-200 bg-white text-stone-400 shadow-sm">
      <span>
        <UserX className="h-12 w-12" />
      </span>
      <div className="text-center">
        <p className="text-lg">No users found.</p>
        <p className="text-sm">
          {query
            ? `No results for "${query}". Try a different name, course, or company.`
            : "Try a different name, course, or company."}
        </p>
      </div>
    </div>
  );
}

export default SearchedUserEmpty;
