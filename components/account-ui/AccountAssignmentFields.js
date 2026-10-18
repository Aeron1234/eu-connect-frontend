"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { hintClass, labelClass, selectTriggerClass, comboboxInputClass } from "./accountFormStyles";

export default function AccountAssignmentFields({
  showCourse, showDepartment, showGender, courses, departments, isPending,
  selectedCourseId, selectedDepartmentId, selectedGender, setSelectedGender,
  handleSelectCourse, handleSelectDepartment,
}) {
  const course = courses.find(item => String(item.id) === String(selectedCourseId));
  const department = departments.find(item => String(item.id) === String(selectedDepartmentId));
  const courseDepartment = departments.find(item => String(item.id) === String(course?.department_id));
  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:grid-cols-2">
      {showCourse && (
        <div className="relative min-w-0">
          <input type="hidden" name="course" value={selectedCourseId} disabled={isPending} />
          <label htmlFor="course" className={labelClass}>Course <span className="text-primary-emphasis">*</span></label>
          <Combobox items={courses.map(item => item.course_name)} value={course?.course_name ?? null} disabled={isPending} onValueChange={handleSelectCourse}>
            <ComboboxInput id="course" placeholder="Search or select a course" className={comboboxInputClass} disabled={isPending} required />
            <ComboboxContent>
              <ComboboxEmpty>No courses found.</ComboboxEmpty>
              <ComboboxList>{name => <ComboboxItem key={name} value={name}>{name}</ComboboxItem>}</ComboboxList>
            </ComboboxContent>
          </Combobox>
          <p className={hintClass}>{course ? "Department: " + (courseDepartment?.name || "—") : "The department is assigned from the selected course."}</p>
        </div>
      )}
      {showDepartment && (
        <div className="relative min-w-0 sm:col-span-2">
          <input type="hidden" name="department" value={selectedDepartmentId} disabled={isPending} />
          <label htmlFor="department" className={labelClass}>Department <span className="text-primary-emphasis">*</span></label>
          <Combobox items={departments.map(item => item.name)} value={department?.name ?? null} disabled={isPending} onValueChange={handleSelectDepartment}>
            <ComboboxInput id="department" placeholder="Search or select a department" className={comboboxInputClass} disabled={isPending} required />
            <ComboboxContent>
              <ComboboxEmpty>No departments found.</ComboboxEmpty>
              <ComboboxList>{name => <ComboboxItem key={name} value={name}>{name}</ComboboxItem>}</ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      )}
      {showGender && (
        <div className="relative min-w-0">
          <input type="hidden" name="gender" value={selectedGender} disabled={isPending} />
          <label htmlFor="gender" className={labelClass}>Gender <span className="text-primary-emphasis">*</span></label>
          <Select value={selectedGender} onValueChange={setSelectedGender} disabled={isPending} required>
            <SelectTrigger id="gender" className={selectTriggerClass}><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
