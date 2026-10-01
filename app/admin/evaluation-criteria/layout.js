import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

function EvaluationCriteriaLayout({ children }) {
  return (
    <Suspense
      fallback={
        <div className="self-center justify-self-center p-5">
          <Spinner className={"size-8 stroke-4 stroke-primary-emphasis"} />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default EvaluationCriteriaLayout;
