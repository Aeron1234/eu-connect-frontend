"use client";

import { RotateCcw, Trash2 } from "lucide-react";
import IconBtn from "./CriteriaIconButton";

export default function EvaluationCriterionRow({
  item, isKeyPending, isMutationPending, onDeactivateCriterion, onReactivateCriterion,
}) {
  const key = `criterion:${item.id}`;
  return (
    <li
      key={item.id}
      className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${
        item.is_active ? "" : "opacity-50"
      }`}
    >
      <span className="flex-1 min-w-0 text-sm text-foreground line-clamp-2">
        {item.label}
      </span>
      {!item.is_active && (
        <span className="flex-shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Inactive
        </span>
      )}
      {item.is_active ? (
        <IconBtn
          title="Deactivate criterion"
          danger
          disabled={isMutationPending || String(item.id).startsWith("temp-")}
          pending={isKeyPending(key)}
          onClick={() => onDeactivateCriterion(item)}
        >
          <Trash2 className="h-4 w-4" />
        </IconBtn>
      ) : (
        <IconBtn
          title="Reactivate criterion"
          disabled={isMutationPending || String(item.id).startsWith("temp-")}
          pending={isKeyPending(key)}
          onClick={() => onReactivateCriterion(item.id)}
        >
          <RotateCcw className="h-4 w-4" />
        </IconBtn>
      )}
    </li>
  );
}
