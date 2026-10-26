import { withReadErrorPage } from "@/lib/page-read-error";
import SearchedUserHeader from "@/components/search-user-ui/SearchedUserHeader";
import SearchedUserRecordsManager from "@/components/search-user-ui/SearchedUserRecordsManager";
import {
  getSearchedStudentDTRs,
  getSearchedStudentDtrLocation,
} from "@/lib/server-actions/dtr-actions";
import { getSearchedUserProfile } from "@/lib/server-actions/account-actions";
import { getUserSession } from "@/lib/server-actions/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const searchedUserId = resolvedParams.userId
    ? decodeURIComponent(resolvedParams.userId)
    : null;

  if (!searchedUserId) return { title: "User Profile" };

  const profileData = await getSearchedUserProfile(searchedUserId);
  const header = profileData?.user?.header;
  if (header) {
    return {
      title: `${header.first_name} ${header.last_name} - Profile`,
    };
  }

  return { title: "User Profile" };
}

async function UserProfilePage({ params, searchParams }) {
  const resolvedParams = await params;

  const searchedUserId = resolvedParams.userId
    ? decodeURIComponent(resolvedParams.userId)
    : null;

  if (!searchedUserId) {
    notFound();
  }

  const session = await getUserSession();
  const profileData = await getSearchedUserProfile(searchedUserId);

  if (!profileData || profileData.error || !profileData.user) {
    return notFound();
  }

  const { header, info, supervision } = profileData.user;

  const userRole = session?.user?.role || null;
  const searchedUserRole = header.role || "student";
  const hasOngoingInternship = profileData.user.hasOngoingInternship !== false;

  const canViewStudentRecords = userRole !== "department_head" || searchedUserRole !== "student" ||
    profileData.user.permissions?.canViewStudentRecords === true;

  const isEmployerNonSupervisor =
    userRole === "employer" &&
    searchedUserRole === "student" &&
    supervision?.status !== "accepted";

  const initialFilter =
    userRole === "student" ||
    searchedUserRole !== "student" ||
    !hasOngoingInternship ||
    isEmployerNonSupervisor ||
    !canViewStudentRecords
      ? "info"
      : "dtr";
  const requestedTab = (await searchParams)?.tab;
  const defaultFilter = requestedTab === "certificates" &&
    userRole === "employer" &&
    searchedUserRole === "student" &&
    hasOngoingInternship &&
    supervision?.status === "accepted"
      ? "certificates"
      : initialFilter;

  // Seed the first page; later DTR pages are fetched by the client query.
  let initialDtrData = null;
  let initialDtrLocation = null;
  if (defaultFilter === "dtr") {
    const [dtrData, dtrLocation] = await Promise.all([
      getSearchedStudentDTRs(searchedUserId, 1),
      ["employer", "admin"].includes(userRole)
        ? getSearchedStudentDtrLocation(searchedUserId)
        : null,
    ]);
    initialDtrData = dtrData;
    initialDtrLocation = dtrLocation;
  }

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
      <SearchedUserHeader
        userProfile={header}
        supervision={supervision || null}
        searchedUserId={searchedUserId}
        userRole={userRole}
        hasOngoingInternship={hasOngoingInternship}
      />

      <SearchedUserRecordsManager
        key={`${searchedUserId}:${userRole}:${searchedUserRole}:${supervision?.status || ""}:${hasOngoingInternship}:${defaultFilter}:${canViewStudentRecords}`}
        searchedUserId={searchedUserId}
        userId={session?.user?.id || ""}
        userRole={userRole}
        searchedUserRole={searchedUserRole}
        hasOngoingInternship={hasOngoingInternship}
        canViewStudentRecords={canViewStudentRecords}
        info={info}
        supervision={supervision || null}
        defaultFilter={defaultFilter}
        initialDtrData={initialDtrData}
        initialDtrLocation={initialDtrLocation}
      />
    </div>
  );
}

export default withReadErrorPage(UserProfilePage);
