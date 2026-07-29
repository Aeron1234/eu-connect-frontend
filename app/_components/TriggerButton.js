"use client";

import React from "react";

const TriggerButton = React.forwardRef(
  (
    {
      icon = null,
      textColor = "",
      bgColor = "",
      label = "",
      type = "",
      className = "",
      ...props
    },
    ref,
  ) => {
    if (type === "mini") {
      return (
        <div
          ref={ref}
          // type="button"
          className={`cursor-pointer transition-colors p-1 ${className}`}
          {...props}
        >
          {icon} {label && label}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        type="button"
        className={`${textColor} ${bgColor} flex items-center gap-1 font-semibold rounded-md p-2 transition-colors h-fit cursor-pointer max-sm:gap-0 ${className}`}
        {...props}
      >
        {icon}
        {label && <span className="max-sm:hidden">{label}</span>}
      </div>
    );
  },
);

TriggerButton.displayName = "TriggerButton";

export default TriggerButton;
