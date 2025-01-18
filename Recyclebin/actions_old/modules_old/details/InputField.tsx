import React, { KeyboardEvent, ChangeEvent, useState, useEffect } from "react";
import { Search, ExternalLink, Plus, X } from "lucide-react";
import { InputFieldProps } from "@/types/types";

const InputField: React.FC<InputFieldProps> = ({
  label,
  value: initialValue = "",
  onChange,
  isEditing,
  type = "text",
  dropdownFields = [],
  required = false,
  disabled = false,
  populatedData,
}) => {
  const convertToArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return typeof value === "string" ? value.split(",").filter(Boolean) : [];
  };

  const [value, setValue] = useState<string | string[]>(
    type === "reference-array" ? convertToArray(initialValue) : initialValue
  );

  useEffect(() => {
    setValue(
      type === "reference-array" ? convertToArray(initialValue) : initialValue
    );
  }, [initialValue, type]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ): void => {
    const newValue = type === "reference-array" && typeof index === "number"
      ? (Array.isArray(value) ? [...value].map((v, i) => i === index ? e.target.value : v) : [e.target.value])
      : e.target.value;
    
    setValue(newValue);
    onChange?.(Array.isArray(newValue) ? newValue.join(",") : newValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.currentTarget.blur();
    }
  };

  const addReference = () => {
    if (type === "reference-array") {
      const newValues = Array.isArray(value) ? [...value, ""] : [""];
      setValue(newValues);
      onChange?.(newValues.join(","));
    }
  };

  const removeReference = (index: number) => {
    if (type === "reference-array" && Array.isArray(value)) {
      const newValues = value.filter((_, i) => i !== index);
      setValue(newValues);
      onChange?.(newValues.join(","));
    }
  };

  if (type === "hidden") return null;

  const renderReferenceDisplay = () => {
    if (type === "reference-array") {
      if (!Array.isArray(populatedData) || populatedData.length === 0) {
        return <span className="reference-empty">No references</span>;
      }

      return (
        <div className="reference-container">
          {populatedData.map((item, index) => (
            <div key={index} className="reference-item">
              <span className="reference-id">{Array.isArray(value) ? value[index] : "-"}</span>
              <div className="reference-link">
                <ExternalLink size={14} />
                <span className="reference-label">{item.label}:</span>
                <span className="reference-value">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!populatedData) {
      return <span className="reference-empty">No reference</span>;
    }

    return (
      <div className="reference-container">
        <span className="reference-id">{value || "-"}</span>
        <div className="reference-link">
          <ExternalLink size={14} />
          <span className="reference-label">{populatedData.label}:</span>
          <span className="reference-value">{populatedData.value}</span>
        </div>
      </div>
    );
  };

  const renderInput = () => {
    switch (type) {
      case "reference-array":
        return (
          <div className="reference-container">
            {Array.isArray(value) && value.map((refValue, index) => (
              <div key={index} className="reference-item">
                <input
                  type="text"
                  value={refValue}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={handleKeyDown}
                  className="input-field"
                  required={required}
                  disabled={disabled}
                  autoFocus={isEditing && index === 0}
                  placeholder="Enter reference ID..."
                />
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="button button-secondary"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addReference}
              className="button button-secondary"
            >
              <Plus size={16} />
              Add Reference
            </button>
          </div>
        );

      case "dropdown":
        return (
          <select
            value={value as string}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="input-field"
            required={required}
            disabled={disabled}
            autoFocus={isEditing}
          >
            <option value="">Select an option</option>
            {dropdownFields.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type={type}
            value={value as string}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="input-field"
            required={required}
            disabled={disabled}
            autoFocus={isEditing}
          />
        );
    }
  };

  return (
    <div className="input-container">
      <label className="input-label">
        {label}
        {required && <span className="input-required">*</span>}
      </label>
      <div className="input-wrapper">
        {isEditing ? (
          renderInput()
        ) : (
          <div className="input-readonly">
            {type === "reference" || type === "reference-array" ? (
              renderReferenceDisplay()
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