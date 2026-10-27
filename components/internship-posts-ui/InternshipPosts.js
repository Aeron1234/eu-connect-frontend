"use client";

import ErrorUI from "@/components/ui/ErrorUI";
import { BriefcaseBusiness } from "lucide-react";
import InternshipPostsList from "./InternshipPostsList";
import InternshipPostsListSkeleton from "../skeletons/InternshipPostsListSkeleton";
import useInternshipPosts from "./useInternshipPosts";
import InternshipPostsFilters from "./InternshipPostsFilters";

export default function InternshipPosts(props) {
  const {
    query,
    setQuery,
    workType,
    setWorkType,
    courseId,
    setCourseId,
    scope,
    setScope,
    favorite,
    setFavorite,
    userRole,
    courses,
    coursesQuery,
    postsQuery,
    internshipPosts,
    total,
    isPending,
    handleItemUpdate,
    handleItemDelete,
    handleFavoriteSettled,
    workTypeOptions,
    courseOptions,
  } = useInternshipPosts(props);

  return (
    <>
      <InternshipPostsFilters
        userRole={userRole}
        scope={scope}
        setScope={setScope}
        query={query}
        setQuery={setQuery}
        workType={workType}
        setWorkType={setWorkType}
        workTypeOptions={workTypeOptions}
        courses={courses}
        courseId={courseId}
        setCourseId={setCourseId}
        courseOptions={courseOptions}
        favorite={favorite}
        setFavorite={setFavorite}
      />

      <p className="text-xs text-muted-foreground">
        {total ? total : null} listings
      </p>

      {coursesQuery.isError && (
        <ErrorUI error={coursesQuery.error} reset={() => void coursesQuery.refetch()} compact logError={false} />
      )}
      {!isPending && postsQuery.isError && postsQuery.data && (
        <ErrorUI error={postsQuery.error} compact logError={false} reset={() => {
          if (postsQuery.isFetchNextPageError) void postsQuery.fetchNextPage();
          else void postsQuery.refetch();
        }} />
      )}

      {isPending ? (
        <div className="space-y-4 sm:space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <InternshipPostsListSkeleton key={i} />
          ))}
        </div>
      ) : postsQuery.isError && !postsQuery.data ? (
        <ErrorUI error={postsQuery.error} reset={() => void postsQuery.refetch()} logError={false} />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {internshipPosts.map((item) => (
            <InternshipPostsList
              key={item.id}
              item={item}
              userRole={userRole}
              courses={courses}
              onUpdate={handleItemUpdate}
              onDelete={() => handleItemDelete(item.id)}
              onFavoriteSettled={handleFavoriteSettled}
            />
          ))}

          {internshipPosts.length === 0 && !isPending && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card px-6 py-16 sm:py-20 text-center">
              <BriefcaseBusiness className="size-8 text-foreground-faint" />
              <p className="text-sm text-muted-foreground">
                No internship listings found.
              </p>
            </div>
          )}
        </div>
      )}

      {!isPending && postsQuery.hasNextPage && (
        <div className="w-full">
          <button
            type="button"
            onClick={() => void postsQuery.fetchNextPage()}
            disabled={isPending}
            className="w-full text-center text-sm sm:text-lg font-semibold text-foreground-soft hover:text-primary-emphasis transition disabled:opacity-50"
          >
            {isPending ? "Loading..." : "See more"}
          </button>
        </div>
      )}
    </>
  );
}
