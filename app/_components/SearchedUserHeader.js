import { ChevronLeft, User } from "lucide-react";
import Link from "next/link";

function SearchedUserHeader({ userProfile = {} }) {
  const percentComplete =
    userProfile?.total_hours > 0
      ? (userProfile?.hours_rendered / userProfile?.total_hours) * 100
      : 0;

  return (
    <div className="w-full">
      {/* Back button */}
      <Link
        href={"/users"}
        className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to search
      </Link>

      {/* Student header card */}
      <div className="bg-white rounded-xl border border-stone-300 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-16 sm:h-20 bg-linear-to-r from-primary-500 to-primary-50" />

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-8 sm:-mt-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-stone-100 border-2 border-white flex items-center justify-center text-stone-400 shrink-0">
              <User className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>

            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-lg font-semibold text-white truncate">
                {userProfile.first_name} {userProfile.last_name}
              </h1>

              {userProfile?.role === "student" && (
                <p className="text-sm text-foreground-muted">
                  {userProfile?.course || "Course not specified"}
                </p>
              )}

              {userProfile?.role === "department_head" && (
                <p className="text-sm text-foreground-muted">
                  Department head of{" "}
                  {userProfile?.department || "Department not specified"}
                </p>
              )}

              {userProfile?.company_name &&
                userProfile?.role === "employer" && (
                  <p className="text-sm text-foreground-muted">
                    {userProfile.company_name}
                  </p>
                )}

              {userProfile?.department && userProfile?.role === "student" && (
                <p className="text-sm text-foreground-muted">
                  {userProfile.department}
                </p>
              )}
            </div>

            {userProfile?.total_hours > 0 && (
              <div className="text-left sm:text-right shrink-0 w-full sm:w-auto pb-1">
                <p className="text-2xl font-bold text-primary-500">
                  {userProfile?.hours_rendered.toFixed(1)}
                  <span className="text-sm font-normal text-foreground-muted">
                    /{userProfile?.total_hours} hrs
                  </span>
                </p>

                <div className="w-full sm:w-32 h-2 bg-stone-200 rounded-full mt-1">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${percentComplete}%` }}
                  />
                </div>

                <p className="text-xs text-foreground-muted mt-1">
                  {percentComplete.toFixed(1)}% completed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchedUserHeader;
