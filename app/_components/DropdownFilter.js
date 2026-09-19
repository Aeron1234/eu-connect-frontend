"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Radix's Select reserves an item value of "" to mean "nothing selected,"
// so it can't be used for a real option. Our filters use "" to mean
// "no filter / show all" (e.g. "All Roles"), so this sentinel stands in
// for "" only inside the Select internals — callers of DropdownFilter
// never see it, they keep working with "".
const ALL_VALUE = "__all__";

/**
 * A generic single-select dropdown filter, built on shadcn's Select.
 *
 * `options` is [{ value, label }, ...]. Give it a leading
 * `{ value: "", label: "All Roles" }` entry when you want a "clear filter"
 * option — the "" is handled transparently, no need to think about Radix's
 * empty-string restriction from the call site.
 *
 * Usage:
 *   <DropdownFilter
 *     value={actorRole}
 *     onValueChange={setActorRole}
 *     options={[
 *       { value: "", label: "All Roles" },
 *       { value: "student", label: "Student" },
 *       { value: "employer", label: "Employer" },
 *     ]}
 *     placeholder="Role"
 *   />
 */
function DropdownFilter({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  className = "h-8 w-[170px] text-xs px-2",
  itemClassName = "text-xs",
}) {
  const normalizedValue = value ?? "";
  const selected = options.find((opt) => opt.value === normalizedValue);

  function handleValueChange(next) {
    onValueChange(next === ALL_VALUE ? "" : next);
  }

  return (
    <Select
      value={normalizedValue === "" ? ALL_VALUE : normalizedValue}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selected?.label ?? placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem
            key={opt.value === "" ? ALL_VALUE : opt.value}
            value={opt.value === "" ? ALL_VALUE : opt.value}
            className={itemClassName}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DropdownFilter;
