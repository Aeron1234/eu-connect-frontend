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
  hint,
  inputMode,
  autoComplete,
  maxLength,
}) {
  return (
    <div className="flex min-w-0 flex-col">
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
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-describedby={hint ? `${name}-hint` : undefined}
      />
      {hint && <p id={`${name}-hint`} className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}
    </div>
  );
}
