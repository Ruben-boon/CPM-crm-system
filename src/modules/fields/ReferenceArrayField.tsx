import React from 'react';
import { Plus, X, ExternalLink, Search } from 'lucide-react';
import BaseField, { ReadOnlyContent } from './BaseField';

interface ReferenceData {
  label: string;
  value: string;
}

interface ReferenceArrayFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  populatedData?: ReferenceData[];
  onSearch?: (value: string) => void;
}

export default function ReferenceArrayField({
  label,
  value = [],
  onChange,
  required,
  disabled,
  isEditing,
  populatedData,
  onSearch
}: ReferenceArrayFieldProps) {
  const handleChange = (index: number, newValue: string) => {
    const newValues = [...value];
    newValues[index] = newValue;
    onChange(newValues);
  };

  const handleAdd = () => {
    onChange([...value, '']);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleSearch = (index: number) => {
    if (onSearch && value[index]) {
      onSearch(value[index]);
    }
  };

  const renderReferenceDisplay = () => {
    if (!populatedData?.length) {
      return <span className="empty-reference">No references</span>;
    }

    return (
      <div className="reference-display">
        {populatedData.map((item, index) => (
          <div key={index} className="reference-item">
            <span className="reference-id">
              Reference ID: <span className="input-monospace">{value[index]}</span>
            </span>
            <div className="reference-link">
              <ExternalLink size={14} />
              <span className="reference-label">{item.label}:</span>
              <span className="reference-value">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <BaseField label={label} required={required}>
      {isEditing ? (
        <div className="reference-field">
          {value.map((ref, index) => (
            <div key={index} className="reference-item">
              <div className="reference-input-wrapper">
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="input-base input-monospace"
                  required={required}
                  disabled={disabled}
                  placeholder="Enter reference ID..."
                  autoFocus={isEditing && index === value.length - 1}
                />
                <Search
                  className="reference-search-icon"
                  size={18}
                  onClick={() => handleSearch(index)}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="button button-secondary"
                aria-label="Remove reference"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            className="button button-secondary"
          >
            <Plus size={16} />
            Add Reference
          </button>
        </div>
      ) : (
        <ReadOnlyContent>
          {renderReferenceDisplay()}
        </ReadOnlyContent>
      )}
    </BaseField>
  );
}