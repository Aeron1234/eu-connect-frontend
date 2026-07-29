import { ChevronLeft } from "lucide-react";
import Link from "next/link";

function SearchedUserHeader({ userProfile = {} }) {
  return (
    <div className="w-full">
      {/* Back button */}
      <Link
        href={"/users"}
        // onClick={() => { setSelectedStudent(null); setActiveTab("dtr"); }}
        className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Student header card */}
      <div className="bg-white rounded-xl border border-stone-300 shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-primary-500 font-bold text-xl shrink-0">
            {userProfile.first_name.charAt(0).toUpperCase()}
            {userProfile.last_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-stone-800 truncate">
              {userProfile.first_name} {userProfile.last_name}
            </h1>
            {userProfile?.role === "student" && (
              <p className="text-sm text-stone-500">
                {userProfile?.course || "Course not specified"}
              </p>
            )}

            {userProfile?.role === "department_head" && (
              <p className="text-sm text-stone-500">
                Department head of{" "}
                {userProfile?.department || "Department not specified"}
              </p>
            )}

            {userProfile?.company_name && userProfile?.role === "employer" && (
              <p className="text-sm text-stone-500">
                {userProfile.company_name}
              </p>
            )}

            {userProfile?.department && userProfile?.role === "student" && (
              <p className="text-sm text-stone-500">{userProfile.department}</p>
            )}
          </div>
          {userProfile?.total_hours > 0 && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-primary-500">
                {userProfile?.hours_rendered.toFixed(1)}
                <span className="text-sm font-normal text-stone-500">
                  /{userProfile?.total_hours} hrs
                </span>
              </p>

              <div className="w-32 h-2 bg-muted rounded-full mt-1">
                <div
                  className="h-full bg-primary-500 rounded-full"
                  style={{
                    width: `${(userProfile?.hours_rendered / userProfile?.total_hours) * 100}%`,
                  }}
                />
              </div>

              <p className="text-xs text-stone-600 mt-1">
                {(
                  (userProfile?.hours_rendered / userProfile?.total_hours) *
                  100
                ).toFixed(1)}
                % completed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchedUserHeader;
