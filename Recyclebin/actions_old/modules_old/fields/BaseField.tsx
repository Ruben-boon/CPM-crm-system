import React from "react";

interface BaseFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export default function BaseField({
  label,
  required,
  children,
}: BaseFieldProps) {
  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      {children}
    </div>
  );
}

interface ReadOnlyContentProps {
  children: React.ReactNode;
}

export function ReadOnlyContent({ children }: ReadOnlyContentProps) {
  return (
    <div className="input-read-only">
      {children ?? <span className="empty-reference">-</span>}
    </div>
  );
}
