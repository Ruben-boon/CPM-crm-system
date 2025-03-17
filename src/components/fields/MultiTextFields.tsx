import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import Button from "@/components/common/Button";

interface MultiTextFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  className?: string;
  placeholder?: string;
}

export function MultiTextField({
  label,
  value = [],
  onChange,
  required = false,
  disabled = false,
  isEditing = false,
  className = "",
  placeholder = "Enter text...",
}: MultiTextFieldProps) {
  const [newEntry, setNewEntry] = useState("");

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      onChange([...value, newEntry.trim()]);
      setNewEntry("");
    }
  };

  const handleRemoveEntry = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
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

  return (
    <div className="multi-text-field">
      <label className="field-label">
        {label}
        {required && <span className="required-mark">*</span>}
      </label>
      <div className="multi-text-field-container">
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

      <style jsx>{`
        .multi-text-field {
          margin-bottom: 1rem;
        }
        
        .entries-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .entry-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background-color: #f0f4f8;
          border-radius: 4px;
        }
        
        .remove-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          padding: 0.25rem;
          border-radius: 4px;
        }
        
        .remove-button:hover {
          color: #d32f2f;
          background-color: rgba(211, 47, 47, 0.1);
        }
        
        .add-entry-container {
          display: flex;
          gap: 0.5rem;
        }
        
        .text-entries-list {
          list-style-type: disc;
          margin: 0;
          padding-left: 1.5rem;
        }
        
        .text-entry-item {
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}