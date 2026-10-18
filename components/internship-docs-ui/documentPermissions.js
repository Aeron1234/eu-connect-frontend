function sameUser(first, second) {
  return first != null && second != null && String(first) !== "" && String(first) === String(second);
}

export function isStudentDocumentOwner({ item, userRole, currentUserId }) {
  return userRole === "student" && sameUser(item.user_id, currentUserId);
}

export function canActuallyApprove({ item, canApprove, userRole, currentUserId }) {
  return Boolean(canApprove) && isStudentDocumentOwner({ item, userRole, currentUserId }) &&
    item.uploaded_by_role === "employer" && item.verification_status === "pending";
}

// Students manage every document they own, including accepted employer uploads.
// Employers retain permission to remove only their own pending uploads.
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
