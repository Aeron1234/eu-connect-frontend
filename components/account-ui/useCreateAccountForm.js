"use client";

import { useState, useTransition } from "react";
import { toastAndAction } from "@/lib/helpers";
import { createUser } from "@/lib/server-actions/account-actions";

const EMPTY_ACCOUNT_FORM = {
  first_name: "",
  middle_initial: "",
  last_name: "",
  username: "",
  password: "qwerty12345",
  email: "",
};

export default function useCreateAccountForm({ roles, courses, departments, onCreated }) {
  const [isPending, startTransition] = useTransition();

  const [isFocused, setIsFocused] = useState(false);
  const [show, setShow] = useState(false);
  const [accountForm, setAccountForm] = useState(EMPTY_ACCOUNT_FORM);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedGender, setSelectedGender] = useState("");

  function handleAction(formData) {
    startTransition(async () => {
      const result = await toastAndAction({
        loadingLabel: "Creating account...",
        successLabel: "Account created successfully.",
        errorLabel: "Failed to create new account.",
        action: createUser,
        args: [formData],
      });

      if (result?.success) {
        setAccountForm(EMPTY_ACCOUNT_FORM);
        setSelectedCourseId("");
        setSelectedDepartmentId("");
        setSelectedRole("");
        setSelectedGender("");
        onCreated?.();
      }
    });
  }

  function handleSelectCourse(name) {
    const course = courses.find((c) => c.course_name === name);
    if (course) setSelectedCourseId(course.id);
  }

  function handleSelectDepartment(name) {
    const department = departments.find((d) => d.name === name);
    if (department) setSelectedDepartmentId(department.id);
  }

  function formatRolesForSelect(role) {
    if (role === "department_head") return "Department Head";
    if (role === "employer") return "Employer";
    if (role === "student") return "Student";
    if (role === "admin") return "Admin";
  }

  // selectedRole holds the role's id (that's what actually gets submitted to
  // the backend as role_id) — but gating which fields show should never rely
  // on that id staying "1 = student" forever, so look up the semantic name
  // from the fetched roles list instead of hardcoding ids here.
  const selectedRoleName = roles.find((r) => `${r.id}` === selectedRole)?.role;

  const showCourse = selectedRoleName === "student";
  const showDepartment = selectedRoleName === "department_head";
  const showGender = selectedRoleName === "student";
  const showConditionalRow = showCourse || showDepartment || showGender;

  return {
    handleAction,
    isPending,
    showConditionalRow,
    identityProps: {
      accountForm, setAccountForm, isPending, roles,
      selectedRole, setSelectedRole, formatRolesForSelect,
    },
    credentialsProps: {
      accountForm, setAccountForm, isPending,
      isFocused, setIsFocused, show, setShow,
    },
    assignmentProps: {
      showCourse, showDepartment, showGender, courses, departments, isPending,
      selectedCourseId, selectedDepartmentId, selectedGender, setSelectedGender,
      handleSelectCourse, handleSelectDepartment,
    },
  };
}
