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
  const sParams = await searchParams;
  const currentDtrPage = Number(sParams.d_page) || 1;
  // NEW — the DTR pagination links always set ?filter=dtr, so this tells
  // us "we're navigating within the dtr tab" even when it isn't this
  // role's default landing tab.
  const requestedFilter = sParams.filter || null;

  const searchedUserId = resolvedParams.userId
    ? decodeURIComponent(resolvedParams.userId)
    : null;

  if (!searchedUserId) {
    return <div className="p-6 text-red-500">User not found</div>;
  }

  const session = await getUserSession();
  const profileData = await getSearchedUserProfile(searchedUserId);

  if (!profileData || profileData.error || !profileData.user) {
    return notFound();
  }

  const { header, info, supervision } = profileData.user;

  const userRole = session?.user?.role || null;
  const searchedUserRole = header.role || "student";

  const isEmployerNonSupervisor =
    userRole === "employer" &&
    searchedUserRole === "student" &&
    supervision?.status !== "accepted";

  const defaultFilter =
    userRole === "student" ||
    searchedUserRole !== "student" ||
    isEmployerNonSupervisor
      ? "info"
      : "dtr";

  // Fetch DTR data server-side whenever it's the default landing tab OR
  // the URL itself points at the dtr tab (a pagination link) — so every
  // navigation, not just the first load, hands the client fresh data.
  let initialDtrData = null;
  let initialDtrLocation = null;
  if (defaultFilter === "dtr" || requestedFilter === "dtr") {
    const [dtrData, dtrLocation] = await Promise.all([
      getSearchedStudentDTRs(searchedUserId, currentDtrPage),
      ["employer", "admin"].includes(userRole)
        ? getSearchedStudentDtrLocation(searchedUserId)
        : null,
    ]);
    initialDtrData = dtrData;
    initialDtrLocation = dtrLocation;
  }

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <SearchedUserHeader
        userProfile={header}
        supervision={supervision || null}
        searchedUserId={searchedUserId}
        userRole={userRole}
      />

      <SearchedUserRecordsManager
        searchedUserId={searchedUserId}
        userId={session?.user?.id || ""}
        userRole={userRole}
        searchedUserRole={searchedUserRole}
        info={info}
        supervision={supervision || null}
        defaultFilter={defaultFilter}
        initialDtrData={initialDtrData}
        initialDtrLocation={initialDtrLocation}
        currentDtrPage={currentDtrPage}
      />
    </main>
  );
}

export default withReadErrorPage(UserProfilePage);
