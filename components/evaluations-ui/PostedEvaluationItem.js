"use client";

import usePostedEvaluation from "./usePostedEvaluation";
import PostedEvaluationHeader from "./PostedEvaluationHeader";
import PostedEvaluationDetails from "./PostedEvaluationDetails";
import PostedEvaluationActions from "./PostedEvaluationActions";

function PostedEvaluationItem({
  ev,
  defaultOpen,
  type = "default",
  onOptimisticRemove,
  onOptimisticRestore,
  onChanged,
}) {
  const {
    open,
    setOpen,
    isPending,
    userId,
    isStaff,
    canPrint,
    total,
    totalMax,
    handleResponse,
    handleRestore,
    handleStaffReview,
  } = usePostedEvaluation({ ev, defaultOpen, type, onOptimisticRemove, onOptimisticRestore, onChanged });
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden mb-3">
      <PostedEvaluationHeader
        ev={ev}
        open={open}
        setOpen={setOpen}
        total={total}
        totalMax={totalMax}
        userId={userId}
        onChanged={onChanged}
      />
      {open && <PostedEvaluationDetails ev={ev} />}
      <PostedEvaluationActions
        ev={ev}
        type={type}
        isPending={isPending}
        canPrint={canPrint}
        isStaff={isStaff}
        handleResponse={handleResponse}
        handleRestore={handleRestore}
        handleStaffReview={handleStaffReview}
      />
    </div>
  );
}
export default PostedEvaluationItem;
