

// canDelete (prop) is a BASELINE permission the caller passes in (e.g.
// "this view is admin-only"), not the final word. This function layers the
// real business rules on top of it:
// - an accepted document can never be deleted by anyone except admin
// - a student can always delete their own document (it's theirs)
// - an employer can only delete a document THEY uploaded, and only while
//   it's still pending
// - anyone else falls back to whatever the caller's baseline canDelete said
export function canActuallyDelete({ item, canDelete, userRole, currentUserId }) {
  if (item.verification_status === "accepted" && userRole !== "admin") {
    return false;
  }
  if (userRole === "student") {
    return true; // it's their own document — always deletable unless accepted (handled above)
  }
  if (userRole === "employer") {
    return (
      item.uploaded_by_id === currentUserId &&
      item.verification_status === "pending"
    );
  }
  return canDelete;
}
