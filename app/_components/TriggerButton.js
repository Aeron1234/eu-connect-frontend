// function TriggerButton({
//   icon = null,
//   textColor = "",
//   bgColor = "",
//   label = "",
//   type = "",
// }) {
//   if (type === "mini")
//     return (
//       <button className={`cursor-pointer transition-colors p-1`}>{icon}</button>
//     );

//   return (
//     <div
//       className={`${textColor} ${bgColor} flex items-center gap-1 font-semibold  cursor-pointer rounded-md p-2 transition-colors`}
//     >
//       {icon} <span>{label}</span>
//     </div>
//   );
// }

// export default TriggerButton;
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
      ...props
    },
    ref,
  ) => {
    if (type === "mini") {
      return (
        <button
          ref={ref}
          type="button"
          className="cursor-pointer transition-colors p-1"
          {...props}
        >
          {icon}
        </button>
      );
    }

    return (
      <div
        ref={ref}
        type="button"
        className={`${textColor} ${bgColor} flex items-center gap-1 font-semibold rounded-md p-2 transition-colors`}
        {...props}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
  },
);

TriggerButton.displayName = "TriggerButton";

export default TriggerButton;
