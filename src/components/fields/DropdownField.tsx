import React from "react";

interface Option {
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label?: string; // Make label optional
  value?: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  placeholder?: string;
  className?: string;
  compact?: boolean; // Add a compact mode for smaller dropdowns
}

export function DropdownField({
  label,
  value = "",
  onChange,
  options,
  required = false,
  disabled,
  isEditing,
  placeholder = "Select an option",
  className = "",
  compact = false,
}: DropdownFieldProps) {
  return (
    <div className={`form-field ${compact ? 'form-field-compact' : ''}`}>
      {label && ( // Only render label if provided
        <label className="field-label">
          {label}
          {isEditing && required && <span className="required-mark"> *</span>}
        </label>
      )}
      {isEditing ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`input-base input-style ${className} ${compact ? 'input-compact' : ''}`}
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
          className={`input-base ${className} ${compact ? 'input-compact' : ''}`}
        />
      )}
    </div>
  );
}