function sameUser(first, second) {
  return first != null && second != null && String(first) !== "" && String(first) === String(second);
}

export function isStudentDocumentOwner({ item, userRole, currentUserId }) {
  return userRole === "student" && sameUser(item.user_id, currentUserId);
}

// Show acceptance only to the owning student for a pending employer upload.
// Feature flags alone do not authorize a different viewer.
export function canActuallyApprove({ item, canApprove, userRole, currentUserId }) {
  return Boolean(canApprove) && isStudentDocumentOwner({ item, userRole, currentUserId }) &&
    item.uploaded_by_role === "employer" && item.verification_status === "pending";
}

// Students can delete their own files, including accepted employer uploads.
// Employers get delete controls only for their own pending uploads; staff follow
// the caller's feature flag, with accepted files reserved for admin outside ownership.
// These UI checks supplement backend permissions.
export function canActuallyDelete({ item, canDelete, userRole, currentUserId }) {
  if (userRole === "student") {
    return isStudentDocumentOwner({ item, userRole, currentUserId });
  }
  if (item.verification_status === "accepted" && userRole !== "admin") {
    return false;
  }
  if (userRole === "employer") {
    return (
      sameUser(item.uploaded_by_id, currentUserId) &&
      item.verification_status === "pending"
    );
  }
  return Boolean(canDelete);
}
