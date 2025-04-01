import React from "react";

interface Option {
  value: string;
  label: string;
}

interface RadioFieldProps {
  label: string;
  fieldPath: string; // Path to the field in the data model
  value: string;
  updateField: (fieldPath: string, value: any) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isChanged?: boolean;
  className?: string;
}

export function RadioField({
  label,
  fieldPath,
  value = "",
  updateField,
  options,
  required = false,
  disabled = false,
  isEditing = false,
  isChanged = false,
  className = "",
}: RadioFieldProps) {
  const handleChange = (selectedValue: string) => {
    updateField(fieldPath, selectedValue);
  };

  // Get the display label for the current value
  const displayLabel = options.find(opt => opt.value === value)?.label || "";

  return (
    <div className="radio-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark"> *</span>}
      </label>
      
      <div className={`radio-options ${className} ${isChanged ? "field-changed" : ""}`}>
        {isEditing ? (
          <div className="radio-group">
            {options.map((option) => (
              <div key={option.value} className="radio-option">
                <input
                  type="radio"
                  id={`radio-${fieldPath}-${option.value}`}
                  name={fieldPath.replace(/\./g, '-')}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleChange(option.value)}
                  disabled={disabled}
                  required={required && options.findIndex(opt => opt.value === value) === -1}
                />
                <label htmlFor={`radio-${fieldPath}-${option.value}`} className="radio-label">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="input-read-only">
            {displayLabel || <span className="empty-reference">-</span>}
          </div>
        )}
      </div>
    </div>
  );
}