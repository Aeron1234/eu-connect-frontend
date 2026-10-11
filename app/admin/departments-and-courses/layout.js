import Loading from "./loading";

import { Suspense } from "react";

function DepartmentsAndCoursesLayout({ children }) {
  return (
    <Suspense
      fallback={
        <Loading />
      }
    >
      {children}
    </Suspense>
  );
}

export default DepartmentsAndCoursesLayout;
