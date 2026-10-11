import Loading from "./loading";
import { Suspense } from "react";

function EvaluationCriteriaLayout({ children }) {
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

export default EvaluationCriteriaLayout;
