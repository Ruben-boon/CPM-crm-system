import React from "react";

interface Option {
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label: string;
  value?: string; // Make optional
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  placeholder?: string;
  className?: string; // Add className support
}

export function DropdownField({
  label,
  value = "", // Default to empty string
  onChange,
  options,
  required = false,
  disabled,
  isEditing,
  placeholder = "Select an option",
  className = "", // Default to empty string
}: DropdownFieldProps) {
  return (
    <div className="form-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark"> *</span>}
      </label>
      {isEditing ? (
        <select
          value={value} // No need for value || "" since we default to "" 
          onChange={(e) => onChange(e.target.value)}
          className={`input-base input-style ${className}`} // Add className support
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
        <input 
          disabled 
          value={options.find(opt => opt.value === value)?.label || ""} 
          className={`input-base ${className}`} // Add className support
        />
      )}
    </div>
  );
}