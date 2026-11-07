"use client";

import { useId, useState } from "react";
import DropdownFilter from "./DropdownFilter";

// Native GET forms need a hidden field; controlled forms can use onValueChange.
export default function FilterSelectField({
  label,
  name,
  value = "",
  onValueChange,
  options,
  className = "mt-1 h-10 w-full min-w-0 rounded-md bg-background px-3 text-sm",
}) {
  const id = useId();
  const [localValue, setLocalValue] = useState(value);
  const selected = onValueChange ? value : localValue;

  return (
    <div className="min-w-0 text-xs font-medium">
      <label htmlFor={id}>{label}</label>
      {name && <input type="hidden" name={name} value={selected} />}
      <DropdownFilter
        id={id}
        aria-label={label}
        value={selected}
        onValueChange={onValueChange || setLocalValue}
        options={options}
        className={className}
      />
    </div>
  );
}
