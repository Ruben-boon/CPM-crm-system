import React from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number" | "tel";
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  className?: string; // Add className to props
}

export function TextField({
  label,
  value = "",
  onChange,
  type = "text",
  required = false,
  disabled,
  isEditing,
  className = "", // Default to empty string
}: TextFieldProps) {
  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark"> *</span>}
      </label>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          className={`input-base ${className}`} // Combine with existing class
          required={required}
          disabled={disabled}
          autoFocus={isEditing}
        />
      ) : (
        <input disabled value={value} className={`input-base ${className}`}>
        </input>
      )}
    </div>
  );
}
