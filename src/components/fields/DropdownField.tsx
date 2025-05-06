import React, { useState } from "react";

function SkeletonLoader() {
  console.log("skeleton loader triggered nice!");
  return <div className="skeleton-item-ref-field"></div>;
}

interface Option {
  value: string;
  label: string;
}

interface DropdownFieldProps {
  label?: string;
  fieldPath: string; // Path to the field in the data model
  value: string;
  updateField?: (fieldPath: string, value: any) => void;
  onChange?: (fieldPath: string, value: any) => void; // Alternative callback
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isChanged?: boolean;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  isLoading?: boolean;
  setFieldLoading?: (isLoading: boolean) => void;
}

export function DropdownField({
  label,
  fieldPath,
  value = "",
  updateField,
  onChange,
  options,
  required = false,
  disabled = false,
  isEditing = false,
  isChanged = false,
  placeholder = "Select an option",
  className = "",
  compact = false,
  isLoading = false,
  setFieldLoading,
}: DropdownFieldProps) {
  const [localLoading, setLocalLoading] = useState(false);

  // Determine if we're in a loading state
  const isFieldLoading = isLoading || localLoading;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (updateField) {
      updateField(fieldPath, e.target.value);
    } else if (onChange) {
      onChange(fieldPath, e.target.value);
    }
  };

  const displayLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={`form-field ${compact ? "form-field-compact" : ""}`}>
      {label && (
        <label className="field-label">
          {label}
          {isEditing && required && <span className="required-mark"> *</span>}
        </label>
      )}

      {isFieldLoading ? (
        <div className="skeleton-wrapper">
          <SkeletonLoader />
        </div>
      ) : isEditing ? (
        <select
          value={value}
          onChange={handleChange}
          className={`input-base input-style ${className} ${
            compact ? "input-compact" : ""
          } ${isChanged ? "field-changed" : ""}`}
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
          value={displayLabel}
          className={`input-base ${className} ${
            compact ? "input-compact" : ""
          }`}
        />
      )}

      <style jsx>{`
        .skeleton-wrapper {
          width: 180px;
          height: ${compact ? "30px" : "38px"};
        }
      `}</style>
    </div>
  );
}
