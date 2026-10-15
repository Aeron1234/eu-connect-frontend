"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList,
} from "@/components/ui/combobox";
import { labelClass, selectTriggerClass, comboboxInputClass } from "./accountFormStyles";

export default function AccountAssignmentFields({
  showCourse, showDepartment, showGender, courses, departments, isPending,
  selectedCourseId, selectedDepartmentId, selectedGender, setSelectedGender,
  handleSelectCourse, handleSelectDepartment,
}) {
  return (
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
  );
}
