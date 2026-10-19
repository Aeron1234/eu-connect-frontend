"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/contexts/UserContext";
import { dtrKeys, studentDtrPageOptions } from "@/lib/cache/dtr-queries";
import DtrTable from "./DtrTable";
import DtrPagination from "./DtrPagination";
import DtrRecordsSkeleton from "@/components/skeletons/DtrRecordsSkeleton";
import ErrorUI from "@/components/ui/ErrorUI";

function StudentDtrHistory({ internshipId, initialPage }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const emptyPage = { dtrs: [], currentPage: 1, totalPages: 1, totalRecords: 0 };
  const pageQuery = useQuery({
    ...studentDtrPageOptions(user?.id, internshipId, page),
    enabled: Boolean(user?.id && internshipId),
    initialData: page === 1
      ? initialPage ?? (!internshipId ? emptyPage : undefined)
      : undefined,
  });

  useEffect(() => {
    if (!user?.id || !initialPage) return;
    queryClient.setQueryData(dtrKeys.studentPage(user.id, internshipId, 1), initialPage);
  }, [initialPage, internshipId, queryClient, user?.id]);

  function handleDeleted() {
    if ((pageQuery.data?.dtrs?.length ?? 0) <= 1 && page > 1) setPage(page - 1);
    void queryClient.invalidateQueries({ queryKey: dtrKeys.student(user?.id, internshipId) });
  }

  if (pageQuery.isPending) {
    return <DtrRecordsSkeleton embedded allowDelete />;
  }
  if (pageQuery.isError) {
    return (
      <ErrorUI error={pageQuery.error} reset={() => void pageQuery.refetch()} compact logError={false} />
    );
  }

  return (
    <>
      <DtrTable dtrs={pageQuery.data?.dtrs || []} allowDelete onDeleted={handleDeleted} />
      <DtrPagination
        page={page}
        totalPages={pageQuery.data?.totalPages}
        onPageChange={setPage}
        disabled={pageQuery.isFetching}
      />
    </>
  );
}

export default StudentDtrHistory;
