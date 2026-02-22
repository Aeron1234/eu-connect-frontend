import { Check } from "lucide-react";

function RequirementsAfter() {
  return (
    <>
      <h3 className="font-bold text-stone-600">After Internship</h3>

      <ul className="pl-2">
        <li className="flex gap-1 items-center">
          <Check strokeWidth={3} color="var(--color-primary-500)" />

          <p>Weekly Journal</p>
        </li>
        <li className="flex gap-1 items-center">
          <Check strokeWidth={3} color="var(--color-primary-500)" />

          <p>Summary Report</p>
        </li>
        <li className="flex gap-1 items-center">
          <Check strokeWidth={3} color="var(--color-primary-500)" />

          <p>Daily Time Record (DTR)</p>
        </li>
        <li className="flex gap-1 items-center">
          <Check strokeWidth={3} color="var(--color-primary-500)" />

          <p>Certificate of Completion</p>
        </li>
      </ul>
    </>
  );
}

export default RequirementsAfter;
