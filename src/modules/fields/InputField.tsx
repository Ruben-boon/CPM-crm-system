"use client";

import { InputFieldProps } from "@/types/types";
import React, { KeyboardEvent, ChangeEvent } from "react";

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
}) => {
  const [value, setValue] = React.useState<string>(initialValue);
  const [previousValue, setPreviousValue] =
    React.useState<string>(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
    setPreviousValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    if (isEditing) {
      setPreviousValue(value);
    }
  }, [isEditing]);

  const handleSave = async (): Promise<void> => {
    try {
      if (onSave) {
        await onSave(value);
      }
    } catch (error) {
      console.error("Error saving:", error);
      setValue(previousValue);
    }
  };

  const handleCancel = (): void => {
    setValue(previousValue);
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const renderInput = () => {
    if (type === "dropdown") {
      return (
        <select
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        required={required}
        disabled={disabled}
        autoFocus={isEditing}
      />
    );
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative flex items-center">
        {isEditing ? (
          <div className="flex w-full">{renderInput()}</div>
        ) : (
          <div className="flex w-full items-center justify-between rounded-md border border-transparent p-2 hover:border-gray-300">
            <span
              className={`text-gray-900 ${disabled ? "text-gray-500" : ""}`}
            >
              {value || "-"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;
