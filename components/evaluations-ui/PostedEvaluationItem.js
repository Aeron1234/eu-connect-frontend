"use client";

import usePostedEvaluation from "./usePostedEvaluation";
import PostedEvaluationHeader from "./PostedEvaluationHeader";
import PostedEvaluationDetails from "./PostedEvaluationDetails";
import PostedEvaluationActions from "./PostedEvaluationActions";

function PostedEvaluationItem({
  ev,
  defaultOpen,
  onChanged,
}) {
  const {
    open,
    setOpen,
    canDelete,
    isStaff,
    canPrint,
    total,
    totalMax,
  } = usePostedEvaluation({ ev, defaultOpen });
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden mb-3">
      <PostedEvaluationHeader
        ev={ev}
        open={open}
        setOpen={setOpen}
        total={total}
        totalMax={totalMax}
        canDelete={canDelete}
        isStaff={isStaff}
        onChanged={onChanged}
      />
      {open && <PostedEvaluationDetails ev={ev} />}
      <PostedEvaluationActions
        ev={ev}
        canPrint={canPrint}
        isStaff={isStaff}
      />
    </div>
  );
}
export default PostedEvaluationItem;
