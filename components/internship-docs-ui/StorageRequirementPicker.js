"use client";

import { useId } from "react";
import { controlClass } from "@/components/ui/ModalForm";
import { modalFormSelectContentClass } from "@/components/ui/modalFormStyles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StorageRequirementPicker({
  isPending,
  selectedRequirementId,
  requirementTypes = [],
  onValueChange,
}) {
  const id = useId();

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium leading-5 text-foreground-soft">Category</label>
      <Select
        name="requirement_type_id"
        required
        value={selectedRequirementId}
        onValueChange={onValueChange}
        disabled={isPending || requirementTypes.length === 0}
      >
        <SelectTrigger
          id={id}
          className={`${controlClass} min-w-0 text-left *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1`}
        >
          <SelectValue placeholder={requirementTypes.length ? "Select a requirement category" : "No requirement categories available"} />
        </SelectTrigger>
        <SelectContent
          position="popper"
          align="start"
          className={modalFormSelectContentClass}
        >
          {requirementTypes.map((reqType) => (
            <SelectItem
              key={reqType.id}
              value={String(reqType.id)}
              className="whitespace-normal break-words py-2"
            >
              {reqType.name} ({reqType.category})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
