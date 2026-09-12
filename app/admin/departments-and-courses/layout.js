import { Spinner } from "@/components/ui/spinner";

import { Suspense } from "react";

function DepartmentsAndCoursesLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="self-center justify-self-center p-5">
          <Spinner className={"size-8 stroke-4 stroke-primary-500"} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default DepartmentsAndCoursesLayout;
