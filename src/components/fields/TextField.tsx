import React from "react";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number" | "tel" | "date";
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  className?: string;
}

export function TextField({
  label,
  value = "",
  onChange,
  type = "text",
  required = false,
  disabled,
  isEditing,
  className = "",
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
          onKeyDown={(e) => type !== "date" && e.key === "Enter" && e.preventDefault()}
          className={`input-base ${className}`}
          required={required}
          disabled={disabled}
          autoFocus={isEditing}
        />
      ) : (
        <input 
          disabled 
          value={type === "date" && value ? new Date(value).toLocaleDateString() : value} 
          className={`input-base ${className}`}
        />
      )}
    </div>
  );
}