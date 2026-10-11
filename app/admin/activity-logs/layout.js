import Loading from "./loading";
import { Suspense } from "react";

function ActivityLogsLayout({ children }) {
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

export default ActivityLogsLayout;
