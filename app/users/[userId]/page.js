import SearchedUserHeader from "@/app/_components/SearchedUserHeader";
import SearchedUserRecordsManager from "@/app/_components/SearchedUserRecordsManager";
import {
  getSearchedUserProfile,
  getSearchedStudentDTRs,
  getSearchedStudentDtrLocation,
} from "@/app/_services/services";
import { getUserSession } from "@/app/_services/auth";
import { notFound } from "next/navigation";

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

  const { header, info } = profileData.user;

  const userRole = session?.user?.role || null;
  const searchedUserRole = header.role || "student";

  // "info" only for students viewing someone, or when the searched user
  // isn't a student at all (employer profiles have no dtr/narratives/etc.).
  // Otherwise staff default to "dtr".
  const defaultFilter =
    userRole === "student" || searchedUserRole !== "student" ? "info" : "dtr";

  // Only fetch DTR data server-side when it's actually the default tab —
  // everything else is fetched client-side on demand when a tab is clicked.
  let initialDtrData = null;
  let initialDtrLocation = null;
  if (defaultFilter === "dtr") {
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
      <SearchedUserHeader userProfile={header} />

      <SearchedUserRecordsManager
        searchedUserId={searchedUserId}
        userId={session?.user?.id || ""}
        userRole={userRole}
        searchedUserRole={searchedUserRole}
        info={info}
        defaultFilter={defaultFilter}
        initialDtrData={initialDtrData}
        initialDtrLocation={initialDtrLocation}
        currentDtrPage={currentDtrPage}
      />
    </main>
  );
}

export default UserProfilePage;
