"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { toastAndAction } from "../../lib/helpers";
import { createUser } from "@/lib/server-actions/account-actions";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

const labelClass = "text-sm font-medium text-foreground";
const inputClass =
  "mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground shadow-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors";
// Matches the height/shadow fix from InternshipRecordForm — no mt-1 here,
// spacing already comes out right without it (same as that component).
const selectTriggerClass =
  "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm shadow-none focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
const comboboxInputClass =
  "mt-1 rounded-md border border-border bg-background py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent";

const EMPTY_ACCOUNT_FORM = {
  first_name: "",
  middle_initial: "",
  last_name: "",
  username: "",
  password: "qwerty12345",
  email: "",
};

function CreateAccountForm({ roles, courses, departments, onCreated }) {
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
        formData,
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

  return (
    <form className="flex-1 text-sm flex flex-col gap-4" action={handleAction}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 items-start">
        <div>
          <label htmlFor="first_name" className={labelClass}>
            First Name *
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Juan"
            className={inputClass}
            value={accountForm.first_name}
            onChange={(e) =>
              setAccountForm((prev) => ({
                ...prev,
                first_name: e.target.value,
              }))
            }
            disabled={isPending}
            required
          />
        </div>

        <div>
          <label htmlFor="middle_initial" className={labelClass}>
            Middle Initial (optional)
          </label>
          <input
            type="text"
            id="middle_initial"
            name="middle_initial"
            placeholder="A"
            className={inputClass}
            maxLength={2}
            pattern="[A-Za-z][.]?"
            title="Enter one letter, optionally followed by a period."
            value={accountForm.middle_initial}
            onChange={(e) => setAccountForm((prev) => ({
              ...prev,
              middle_initial: e.target.value,
            }))}
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="last_name" className={labelClass}>
            Last Name *
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Dela Cruz"
            className={inputClass}
            value={accountForm.last_name}
            onChange={(e) =>
              setAccountForm((prev) => ({
                ...prev,
                last_name: e.target.value,
              }))
            }
            disabled={isPending}
            required
          />
        </div>

        <div>
          <label htmlFor="role" className={labelClass}>
            Role *
          </label>

          <input
            type="hidden"
            name="role"
            value={selectedRole}
            disabled={isPending}
          />
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
            disabled={isPending}
          >
            <SelectTrigger id="role" className={`mt-1 ${selectTriggerClass}`}>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Roles</SelectLabel>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={`${role.id}`}>
                    {formatRolesForSelect(role.role)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 items-start">
        <div>
          <label htmlFor="username" className={labelClass}>
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="jdc_cnahs"
            className={inputClass}
            value={accountForm.username}
            onChange={(e) =>
              setAccountForm((prev) => ({
                ...prev,
                username: e.target.value,
              }))
            }
            disabled={isPending}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Temporary Password *
          </label>
          <div
            className={`mt-1 flex h-10 items-center gap-1 w-full rounded-md border border-border bg-background px-3 shadow-none ${isFocused ? "outline-none ring-2 ring-primary-300 border-transparent" : ""} transition-all`}
          >
            <input
              type={!show ? "password" : "text"}
              id="password"
              name="password"
              placeholder="minimum 8 characters"
              className="flex-1 outline-none bg-transparent text-sm"
              minLength={8}
              value={accountForm.password}
              onChange={(e) =>
                setAccountForm((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isPending}
              required
            />
            <div
              className={`justify-self-end cursor-pointer hover:bg-secondary rounded-md p-1 transition-all text-muted-foreground ${isPending ? "pointer-events-none hidden cursor-normal opacity-0" : ""}`}
              onClick={() => setShow((val) => !val)}
            >
              {show ? (
                <EyeOff className="h-4 w-5" />
              ) : (
                <Eye className="h-4 w-5" />
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email Address (optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="user@email.com"
            className={inputClass}
            value={accountForm.email}
            onChange={(e) =>
              setAccountForm((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={isPending}
          />
        </div>
      </div>

      {showConditionalRow && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 items-start">
          {showCourse && (
            <div className="flex flex-col">
              <input
                type="hidden"
                name="course"
                value={selectedCourseId}
                disabled={isPending}
                className="pointer-events-none"
              />
              <label htmlFor="course" className={labelClass}>
                Course *
              </label>
              <Combobox
                items={courses}
                id="course"
                disabled={isPending}
                onValueChange={handleSelectCourse}
              >
                <ComboboxInput
                  placeholder="Select a course"
                  className={comboboxInputClass}
                />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(course) => (
                      <ComboboxItem
                        key={course.id}
                        value={`${course.course_name}`}
                      >
                        {course.course_name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {selectedCourseId && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Department:{" "}
                  {departments.find(
                    (d) =>
                      d.id ===
                      courses.find((c) => c.id === selectedCourseId)
                        ?.department_id,
                  )?.name || "—"}
                </p>
              )}
            </div>
          )}

          {showDepartment && (
            <div className="flex flex-col">
              <input
                type="hidden"
                name="department"
                value={selectedDepartmentId}
                disabled={isPending}
                className="pointer-events-none"
              />
              <label htmlFor="department" className={labelClass}>
                Department *
              </label>
              <Combobox
                items={departments}
                id="department"
                disabled={isPending}
                onValueChange={handleSelectDepartment}
              >
                <ComboboxInput
                  placeholder="Select a department"
                  className={comboboxInputClass}
                />
                <ComboboxContent>
                  <ComboboxEmpty>No items found.</ComboboxEmpty>
                  <ComboboxList>
                    {(department) => (
                      <ComboboxItem
                        key={department.id}
                        value={`${department.name}`}
                      >
                        {department.name} ({department.code})
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          )}

          {showGender && (
            <div className="flex flex-col">
              <input
                type="hidden"
                name="gender"
                value={selectedGender}
                disabled={isPending}
              />
              <label htmlFor="gender" className={labelClass}>
                Gender *
              </label>
              <Select
                value={selectedGender}
                onValueChange={setSelectedGender}
                disabled={isPending}
              >
                <SelectTrigger
                  id="gender"
                  className={`mt-1 ${selectTriggerClass}`}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gender</SelectLabel>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className="h-full flex items-end justify-end mt-4">
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          disabled={isPending}
        >
          {isPending ? (
            <Spinner className={"size-6 stroke-3 stroke-primary-50"} />
          ) : (
            <>
              <span>
                <UserPlus className="h-5 w-5" />
              </span>{" "}
              Create Account
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default CreateAccountForm;
