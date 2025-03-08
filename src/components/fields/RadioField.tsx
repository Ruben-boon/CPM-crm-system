import React from "react";

interface Option {
  value: string;
  label: string;
}

interface RadioFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  className?: string;
}

export function RadioField({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled,
  isEditing,
  className = "",
}: RadioFieldProps) {
  return (
    <div className="radio-field">
      <label className="field-label">
        {label}
        {isEditing && required && <span className="required-mark"> *</span>}
      </label>
      <div className={`radio-options ${className}`}>
        {isEditing ? (
          <div className="radio-group">
            {options.map((option) => (
              <div key={option.value} className="radio-option">
                <input
                  type="radio"
                  id={`radio-${option.value}`}
                  name={label.replace(/\s+/g, '-').toLowerCase()}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                  disabled={disabled}
                  required={required && options.findIndex(opt => opt.value === value) === -1}
                />
                <label htmlFor={`radio-${option.value}`} className="radio-label">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div className="input-read-only">
            {options.find(opt => opt.value === value)?.label || <span className="empty-reference">-</span>}
          </div>
        )}
      </div>
    </div>
  );
}