"use client";

import { labelClass, inputClass } from "./internshipFormStyles";

export default function InternshipFormInput({
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  disabled,
  required = true,
}) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        placeholder={placeholder}
        className={inputClass}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
    </div>
  );
}
