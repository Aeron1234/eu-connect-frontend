import { Check } from "lucide-react";

function RequirementsBefore() {
  return (
    <>
      <h3 className="font-bold text-stone-600">Before Internship</h3>

      <ul className="pl-2 flex flex-col gap-0.5">
        <li className="flex gap-1 items-center">
          {/* <Check strokeWidth={3} color="var(--color-primary-500)" /> */}

          {/* <Checkbox /> */}

          <p>Curriculum Vitae</p>
        </li>
        <li className="flex gap-1 items-center">
          {/* <Check strokeWidth={3} color="var(--color-primary-500)" /> */}

          <p>Student's Registration</p>
        </li>
        <li className="flex gap-1 items-center">
          {/* <Check strokeWidth={3} color="var(--color-primary-500)" /> */}

          <p>Endorsement letter / Recommendation letter</p>
        </li>
        <li className="flex gap-1 items-center">
          {/* <Check strokeWidth={3} color="var(--color-primary-500)" /> */}

          <p>Training Agreement - notarize</p>
        </li>
        <li className="flex gap-1 items-center">
          {/* <Check strokeWidth={3} color="var(--color-primary-500)" /> */}

          <p>Parent's Consent with valid ID - notarize</p>
        </li>
        <li className="flex gap-1 items-center">
          {/* <Check strokeWidth={3} color="var(--color-primary-500)" /> */}

          <p>Memorandum of Agreement - notarize</p>
        </li>
        <li className="flex gap-1 items-center">
          {/* <Check strokeWidth={3} color="var(--color-primary-500)" /> */}

          <p>Medical / Psychological Certificate</p>
        </li>
      </ul>
    </>
  );
}

export default RequirementsBefore;
