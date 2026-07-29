import PageContainer from "@/app/_components/PageContainer";
import SearchedUserFilter from "@/app/_components/SearchedUserFilter";
import SearchedUserHeader from "@/app/_components/SearchedUserHeader";
import SearchedUserRecords from "@/app/_components/SearchedUserRecords";
import {
  getUserSession,
  getSearchedUserProfile,
} from "@/app/_services/services";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const searchedUserId = resolvedParams.userId
    ? decodeURIComponent(resolvedParams.userId)
    : null;

  if (!searchedUserId) return { title: "User Profile" };

  const profileData = await getSearchedUserProfile(searchedUserId);
  if (profileData?.user) {
    return {
      title: `${profileData.user.first_name} ${profileData.user.last_name} - Profile`,
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

  const userRole = session?.user.role || null;
  const searchedUserRole = profileData.user.role || "student";

  const filter =
    userRole === "student" || searchedUserRole !== "student"
      ? "info"
      : sParams.filter || "dtr";

  console.log(profileData);

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto space-y-6">
      <SearchedUserHeader userProfile={profileData.user} />

      <SearchedUserFilter
        searchedUserId={searchedUserId}
        filter={filter}
        userRole={userRole}
        searchedUserRole={searchedUserRole}
      />

      <div>
        <Suspense
          fallback={
            <div className="self-center justify-self-center p-5">
              <span className="sr-only">Loading profile records...</span>
              <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
            </div>
          }
        >
          <SearchedUserRecords
            filter={filter}
            searchedUserId={searchedUserId}
            userId={session?.user.id || ""}
            userRole={userRole}
            searchedUserRole={searchedUserRole}
            currentDtrPage={currentDtrPage}
          />
        </Suspense>
      </div>
    </main>
  );
}

export default UserProfilePage;
