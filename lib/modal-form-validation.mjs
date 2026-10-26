function fieldLabel(field) {
  return (field.dataset?.validationLabel || field.getAttribute?.("aria-label") ||
    field.labels?.[0]?.textContent || field.name?.replace(/_id$/, "").replace(/_/g, " ") || "This field")
    .replace(/\s+/g, " ").replace(/\s*\*\s*$/, "").trim();
}

function disabled(field) {
  return field.disabled || field.matches?.(":disabled");
}

// Check controls in DOM order before custom required groups. Disabled controls/
// fieldsets are skipped; required hidden fields can represent custom Select values.
// Required text rejects whitespace, while other validity rules remain native.
export function getModalFormError(form) {
  for (const field of Array.from(form.elements)) {
    if (disabled(field) || (!field.willValidate && !(field.type === "hidden" && field.required))) continue;
    const missing = field.validity?.valueMissing || (field.required &&
      !["checkbox", "radio", "file"].includes(field.type) && !String(field.value ?? "").trim());
    if (missing) return { field, message: fieldLabel(field) + " is required." };
    if (field.validity?.valid === false) return { field, message: field.validationMessage || "Please check " + fieldLabel(field) + "." };
  }
  // A required checkbox/radio group needs one enabled selection. A wholly disabled
  // group is exempt; an empty group still reports its custom required message.
  for (const group of form.querySelectorAll("[data-required-group]")) {
    const options = Array.from(group.querySelectorAll('input[type="checkbox"], input[type="radio"]'));
    const enabled = options.filter(field => !disabled(field));
    if (options.length && !enabled.length) continue;
    if (!enabled.some(field => field.checked)) return {
      field: enabled[0] || group,
      message: group.dataset.validationMessage || "Select at least one " + group.dataset.requiredGroup.replace(/_/g, " ") + ".",
    };
  }
  return null;
}

export function validateModalForm(form, notify) {
  const error = getModalFormError(form);
  if (!error) return true;
  notify(error.message);
  // Radix Select submits through a hidden native select. Focus its visible
  // trigger instead; hidden required inputs can identify a trigger by ID.
  const { field } = error;
  const target = (field.dataset?.validationFocus && form.ownerDocument.getElementById(field.dataset.validationFocus)) ||
    ((field.type === "hidden" || field.getAttribute?.("aria-hidden") === "true") && field.parentElement?.querySelector('[role="combobox"]')) || field;
  target.focus?.({ preventScroll: true });
  target.scrollIntoView?.({ block: "nearest" });
  return false;
}
