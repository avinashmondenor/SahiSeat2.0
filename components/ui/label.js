import React from "react";

export function Label({ children, className = "", ...props }) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}