import React from "react";
import { InputFieldProps } from "./types";
import "./styles.css";
import { ReferenceInput } from "./ReferenceInput";
import { ReferenceDisplay } from "./ReferenceDisplay";

const InputField: React.FC<InputFieldProps> = ({
  label,
  value: initialValue = "",
  onSave,
  isEditing,
  type = "text",
  dropdownFields = [],
  required = false,
  disabled = false,
  onCancel,
  onChange,
  populatedData,
}) => {
  // Your existing state management code...

  if (type === "hidden") {
    return null;
  }

  const renderInput = () => {
    if (type === "reference" || type === "reference-array") {
      return (
        <ReferenceInput
          type={type}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          required={required}
          disabled={disabled}
          isEditing={isEditing}
          onRemove={removeReference}
          onAdd={addReference}
        />
      );
    }

    if (type === "dropdown") {
      return (
        <select
          value={value as string}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="input-base"
          required={required}
          disabled={disabled}
          autoFocus={isEditing}
        >
          <option value="">Select an option</option>
          {dropdownFields.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        value={value as string}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="input-base"
        required={required}
        disabled={disabled}
        autoFocus={isEditing}
      />
    );
  };

  return (
    <div className="input-field-container">
      <label className="input-label">
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      <div className="input-wrapper">
        {isEditing ? (
          renderInput()
        ) : (
          <div className="display-container">
            {type === "reference" || type === "reference-array" ? (
              <ReferenceDisplay
                type={type}
                value={value}
                populatedData={populatedData}
              />
            ) : (
              <span>{value || "-"}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;
