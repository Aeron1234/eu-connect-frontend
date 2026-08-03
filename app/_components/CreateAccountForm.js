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
import { toastAndAction } from "../_services/helpers";
import { createUser } from "../_services/admin-actions";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

function CreateAccountForm({ roles, courses, departments }) {
  const [isPending, startTransition] = useTransition();

  const [isFocused, setIsFocused] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const STUDENT = "1";
  const EMPLOYER = "2";
  const DEPARTMENT_HEAD = "3";
  const ADMIN = "4";

  function handleAction(formData) {
    startTransition(() =>
      toastAndAction({
        loadingLabel: "Creating account...",
        successLabel: "Account created successfully.",
        errorLabel: "Failed to create new account.",
        action: createUser,
        formData,
      }),
    );
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

  return (
    <form className="flex-1 text-sm flex flex-col gap-4 " action={handleAction}>
      <div className="grid grid-cols-3 gap-8 max-xl:gap-4 max-md:gap-2 items-center h-fit">
        <div className="flex-1">
          <label htmlFor="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            placeholder="Juan"
            className="w-full rounded-sm border bg-stone-100 border-stone-300 p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
            disabled={isPending}
            required
          />
        </div>

        <div className="flex-1">
          <label htmlFor="last_name">Last Name *</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            placeholder="Dela Cruz"
            className="w-full rounded-sm border bg-stone-100 border-stone-300 p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
            disabled={isPending}
            required
          />
        </div>

        <div className="flex-1">
          <label htmlFor="role">Role *</label>

          <input
            type="hidden"
            name="role"
            value={selectedRole}
            disabled={isPending}
          />
          <Select
            name="role"
            className="w-full h-full"
            onValueChange={setSelectedRole}
            disabled={isPending}
          >
            <SelectTrigger
              id="role"
              className="h-9.5 px-3 text-sm w-full mt-1 bg-stone-100  rounded-sm border border-stone-300 focus:ring-2 focus:ring-stone-300 focus:border-transparent"
            >
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

      <div className="grid grid-cols-3 gap-y-4 gap-x-8 max-xl:gap-x-4 max-md:gap-x-2 items-center h-fit">
        <div className="flex-1">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="user@email.com"
            className="w-full rounded-sm border bg-stone-100 border-stone-300 p-2 mt-1 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent"
            disabled={isPending}
            required
          />
        </div>

        <div className="flex-1">
          <label htmlFor="password">Temporary Password *</label>
          <div
            className={`flex items-center gap-1 w-full rounded-sm border bg-stone-100 border-stone-300 px-2 mt-1 ${isFocused ? "outline-none ring-2 ring-stone-300 border-transparent" : ""} transition-all`}
          >
            <input
              type={!show ? "password" : "text"}
              id="password"
              name="password"
              placeholder="minimum 8 characters"
              className="flex-1 outline-none py-2"
              minLength={8}
              defaultValue={"00000000"}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isPending}
              required
            />
            <div
              className={`justify-self-end cursor-pointer hover:bg-stone-200 rounded-sm p-1 transition-all text-stone-600 ${isPending ? "pointer-events-none hidden cursor-normal opacity-0" : ""}`}
              onClick={() => setShow((val) => !val)}
            >
              {!show ? (
                <EyeOff className="h-4 w-5" />
              ) : (
                <Eye className="h-4 w-5" />
              )}
            </div>
          </div>
        </div>

        {selectedRole === STUDENT && (
          <div className="flex flex-col flex-1">
            <input
              type="hidden"
              name="course"
              value={selectedCourseId}
              disabled={isPending}
              className="pointer-events-none"
            />
            <label htmlFor="course">Course *</label>
            <Combobox
              items={courses}
              id="course"
              disabled={isPending}
              onValueChange={handleSelectCourse}
            >
              <ComboboxInput
                placeholder="Select a course"
                className={
                  "rounded-sm border bg-stone-100 border-stone-300 py-2.5 mt-1"
                }
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
          </div>
        )}

        {selectedRole === STUDENT || selectedRole === DEPARTMENT_HEAD ? (
          <div className="flex flex-col flex-1">
            <input
              type="hidden"
              name="department"
              value={selectedDepartmentId}
              className="pointer-events-none"
            />
            <label htmlFor="course">Department *</label>
            <Combobox
              items={departments}
              id="department"
              onValueChange={handleSelectDepartment}
            >
              <ComboboxInput
                placeholder="Select a department"
                className={
                  "rounded-sm border bg-stone-100 border-stone-300 py-2.5 mt-1"
                }
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
        ) : null}
      </div>

      <div className="h-full flex items-end justify-end mt-4">
        <button
          className={` bg-primary-500 text-white font-bold flex items-center gap-2 w-fit p-2 rounded-sm cursor-pointer hover:bg-primary-400 transition-colors ${isPending ? "opacity-1/10" : ""}`}
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
