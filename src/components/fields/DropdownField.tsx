import React from "react";

interface Option {
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  placeholder?: string;
}

export function DropdownField({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled,
  isEditing,
  placeholder = "Select an option",
}: DropdownFieldProps) {
  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark"> *</span>}
      </label>
      {isEditing ? (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="input-base input-style"
          required={required}
          disabled={disabled}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="input-read-only">
          {options.find(opt => opt.value === value)?.label || <span className="empty-reference">-</span>}
        </div>
      )}
    </div>
  );
}