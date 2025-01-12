import React from 'react';
import { Search, X, Plus } from 'lucide-react';

interface ReferenceInputProps {
  type: string;
  value: string | string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>, index?: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  onRemove?: (index: number) => void;
  onAdd?: () => void;
}

export const ReferenceInput: React.FC<ReferenceInputProps> = ({
  type,
  value,
  onChange,
  onKeyDown,
  required,
  disabled,
  isEditing,
  onRemove,
  onAdd
}) => {
  if (type === "reference-array") {
    return (
      <div className="reference-container">
        {Array.isArray(value) && value.map((refValue, index) => (
          <div key={index} className="reference-item">
            <div className="input-container">
              <input
                type="text"
                value={refValue}
                onChange={(e) => onChange(e, index)}
                onKeyDown={onKeyDown}
                className="input-base"
                required={required}
                disabled={disabled}
                autoFocus={isEditing && index === 0}
                placeholder="Enter reference ID..."
              />
              <Search className="search-icon" size={18} />
            </div>
            <button
              type="button"
              onClick={() => onRemove?.(index)}
              className="remove-button"
            >
              <X size={18} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={onAdd}
          className="add-reference-button"
        >
          <Plus size={16} />
          Add Reference
        </button>
      </div>
    );
  }

  return (
    <div className="input-container">
      <input
        type="text"
        value={value as string}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="input-base"
        required={required}
        disabled={disabled}
        autoFocus={isEditing}
        placeholder="Enter reference ID..."
      />
      <Search className="search-icon" size={18} />
    </div>
  );
};