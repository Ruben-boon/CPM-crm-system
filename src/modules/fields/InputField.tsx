"use client";
import { InputFieldProps } from "@/types/types";
import React, { KeyboardEvent, ChangeEvent } from "react";
import { Search, ExternalLink, Plus, X } from "lucide-react";

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
  // Helper function to convert initial value to array if needed
  const convertToArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return typeof value === 'string' ? value.split(',').filter(Boolean) : [];
  };

  // Handle both string and array values
  const [value, setValue] = React.useState<string | string[]>(
    type === "reference-array" ? convertToArray(initialValue) : initialValue
  );
  
  const [previousValue, setPreviousValue] = React.useState<string | string[]>(
    type === "reference-array" ? convertToArray(initialValue) : initialValue
  );

  React.useEffect(() => {
    setValue(type === "reference-array" ? convertToArray(initialValue) : initialValue);
    setPreviousValue(type === "reference-array" ? convertToArray(initialValue) : initialValue);
  }, [initialValue, type]);

  React.useEffect(() => {
    if (isEditing) {
      setPreviousValue(value);
    }
  }, [isEditing, value]);

  if (type === "hidden") {
    return null;
  }

  const handleSave = async (): Promise<void> => {
    try {
      if (onSave) {
        await onSave(Array.isArray(value) ? value.join(',') : value);
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
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ): void => {
    if (type === "reference-array" && typeof index === 'number') {
      const newValues = Array.isArray(value) ? [...value] : [];
      newValues[index] = e.target.value;
      setValue(newValues);
      if (onChange) {
        onChange(newValues.join(','));
      }
    } else {
      setValue(e.target.value);
      if (onChange) {
        onChange(e.target.value);
      }
    }
  };

  const addReference = () => {
    if (type === "reference-array") {
      setValue(prev => Array.isArray(prev) ? [...prev, ''] : ['']);
    }
  };

  const removeReference = (index: number) => {
    if (type === "reference-array" && Array.isArray(value)) {
      const newValues = value.filter((_, i) => i !== index);
      setValue(newValues);
      if (onChange) {
        onChange(newValues.join(','));
      }
    }
  };

  const renderReferenceDisplay = () => {
    if (type === "reference-array") {
      if (!Array.isArray(populatedData) || populatedData.length === 0) {
        return <span className="text-gray-400 italic">No bookings</span>;
      }

      return (
        <div className="flex flex-col gap-2">
          {populatedData.map((item, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Reference ID:</span>
                <span className="font-mono text-sm">
                  {Array.isArray(value) ? value[index] : '-'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink size={14} className="text-gray-400" />
                <span className="font-medium">{item.label}:</span>
                <span className="text-blue-600">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Single reference display
    if (!populatedData) {
      return <span className="text-gray-400 italic">No bookings</span>;
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Reference ID:</span>
          <span className="font-mono text-sm">{value || "-"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ExternalLink size={14} className="text-gray-400" />
          <span className="font-medium">{populatedData.label}:</span>
          <span className="text-blue-600">{populatedData.value}</span>
        </div>
      </div>
    );
  };

  const renderInput = () => {
    switch (type) {
      case "reference-array":
        return (
          <div className="flex flex-col gap-2">
            {Array.isArray(value) && value.map((refValue, index) => (
              <div key={index} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={refValue}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={handleKeyDown}
                    className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    required={required}
                    disabled={disabled}
                    autoFocus={isEditing && index === 0}
                    placeholder="Enter reference ID..."
                  />
                  <Search 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500" 
                    size={18}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addReference}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
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

      case "reference":
        return (
          <div className="relative w-full">
            <input
              type="text"
              value={value as string}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="w-full rounded-md border border-gray-300 p-2 pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              required={required}
              disabled={disabled}
              autoFocus={isEditing}
              placeholder="Enter reference ID..."
            />
            <Search 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-blue-500" 
              size={18}
            />
          </div>
        );

      default:
        return (
          <input
            type={type}
            value={value as string}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            required={required}
            disabled={disabled}
            autoFocus={isEditing}
          />
        );
    }
  };

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative flex flex-col gap-1">
        {isEditing ? (
          <div className="flex w-full">{renderInput()}</div>
        ) : (
          <div className="flex w-full rounded-md border border-transparent p-2 hover:border-gray-300 bg-gray-50">
            {(type === "reference" || type === "reference-array") ? (
              renderReferenceDisplay()
            ) : (
              <span className={`text-gray-900 ${disabled ? "text-gray-500" : ""}`}>
                {value || "-"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;