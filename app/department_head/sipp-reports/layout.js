import Loading from "./loading";
import { Suspense } from "react";

function SIPPReportsLayout({ children }) {
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

export default SIPPReportsLayout;
