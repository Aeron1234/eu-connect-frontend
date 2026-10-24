"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { controlClass, modalFormSelectContentClass } from "@/components/ui/modalFormStyles";

export default function FeedbackSelect({ value, onValueChange, options, label, disabled, id }) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} aria-label={label} className={controlClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start" className={modalFormSelectContentClass}>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value} className="whitespace-normal break-words py-2">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
