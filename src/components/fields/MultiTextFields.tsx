import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "@/components/common/Button";

interface MultiTextFieldProps {
  label: string;
  fieldPath: string; // Path to the field in the data model
  value: string[];
  updateField: (fieldPath: string, value: any) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  isChanged?: boolean;
  className?: string;
  placeholder?: string;
  setFieldLoading?: (fieldPath: string, isLoading: boolean) => void;
}

export function MultiTextField({
  label,
  fieldPath,
  value = [],
  updateField,
  required = false,
  disabled = false,
  isEditing = false,
  isChanged = false,
  className = "",
  placeholder = "Enter text...",
  setFieldLoading,
}: MultiTextFieldProps) {
  const [newEntry, setNewEntry] = useState("");

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      // Since this is just a client-side update with no async operations,
      // we don't need to set loading state
      const newValue = [...value, newEntry.trim()];
      updateField(fieldPath, newValue);
      setNewEntry("");
    }
  };

  const handleRemoveEntry = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    updateField(fieldPath, newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEntry();
    }
  };

  // Read-only view
  if (!isEditing) {
    return (
      <div className="multi-text-field">
        <label className="field-label">{label}</label>
        <div className={`read-only ${className}`}>
          {value.length > 0 ? (
            <ul className="text-entries-list">
              {value.map((entry, index) => (
                <li key={index} className="text-entry-item">{entry}</li>
              ))}
            </ul>
          ) : (
            <span className="empty-reference">-</span>
          )}
        </div>
      </div>
    );
  }

  // Editable view
  return (
    <div className="multi-text-field">
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      
      <div className={`multi-text-field-container ${isChanged ? "field-changed" : ""}`}>
        <div className="entries-list">
          {value.map((entry, index) => (
            <div key={index} className="entry-item">
              <span>{entry}</span>
              <button
                type="button"
                onClick={() => handleRemoveEntry(index)}
                className="remove-button"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="add-entry-container">
          <input
            type="text"
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`input-base ${className}`}
            placeholder={placeholder}
            disabled={disabled}
          />
          <Button
            type="button"
            intent="secondary"
            size="sm"
            icon={Plus}
            onClick={handleAddEntry}
            disabled={disabled || !newEntry.trim()}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}