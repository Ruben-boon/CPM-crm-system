import React from "react";

interface TextFieldProps {
  label: string;
  fieldPath: string; // Path to the field in the data model (e.g., "general.firstName")
  value: string;
  updateField: (fieldPath: string, value: any) => void;
  onChange?: (fieldPath: string, value: any) => void; // Optional alternative callback
  type?: "text" | "email" | "number" | "tel" | "date";
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isChanged?: boolean;
  multiline?: boolean;
  rows?: number;
  className?: string;
  placeholder?: string;
}

export function TextField({
  label,
  fieldPath,
  value = "",
  updateField,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  isEditing = false,
  isChanged = false,
  multiline = false,
  rows = 4,
  className = "",
  placeholder = "",
}: TextFieldProps) {
  // Use either updateField or onChange as the handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (onChange) {
      onChange(fieldPath, e.target.value);
    } else if (updateField) {
      updateField(fieldPath, e.target.value);
    }
  };

  // Get today's date in YYYY-MM-DD format for the min attribute
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Read-only view
  if (!isEditing) {
    return (
      <div className={`form-field ${multiline ? "text-area" : ""}`}>
        <label className="field-label">{label}</label>
        {multiline ? (
          <div className={`read-only-text ${className}`}>
            {value || <span className="empty-reference">-</span>}
          </div>
        ) : (
          <input
            disabled
            value={
              type === "date" && value
                ? new Date(value).toLocaleDateString()
                : value
            }
            className={`input-base ${className}`}
          />
        )}
      </div>
    );
  }

  // Editable view
  return (
    <div className={`form-field ${multiline ? "text-area" : ""}`}>
      <label className="field-label">
        {label}
        {required && <span className="required-mark"> *</span>}
      </label>

      {multiline ? (
        <textarea
          value={value}
          onChange={handleChange}
          className={`input-base ${className} ${
            isChanged ? "field-changed" : ""
          }`}
          required={required}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onKeyDown={(e) =>
            type !== "date" && e.key === "Enter" && e.preventDefault()
          }
          className={`input-base ${className} ${
            isChanged ? "field-changed" : ""
          }`}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          min={type === "date" && !value ? getTodayString() : undefined}
        />
      )}
    </div>
  );
}
