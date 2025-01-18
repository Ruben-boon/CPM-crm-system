import React from 'react';
import { Search, ExternalLink } from 'lucide-react';
import BaseField, { ReadOnlyContent } from './BaseField';

interface ReferenceData {
  label: string;
  value: string;
}

interface ReferenceFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
  populatedData?: ReferenceData;
  onSearch?: (value: string) => void;
}

export default function ReferenceField({
  label,
  value,
  onChange,
  required,
  disabled,
  isEditing,
  populatedData,
  onSearch
}: ReferenceFieldProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSearch = () => {
    if (onSearch && value) {
      onSearch(value);
    }
  };

  const renderReferenceDisplay = () => {
    if (!populatedData) {
      return <span className="empty-reference">No reference</span>;
    }

    return (
      <div className="reference-display">
        <span className="reference-id">
          Reference ID: <span className="input-monospace">{value}</span>
        </span>
        <div className="reference-link">
          <ExternalLink size={14} />
          <span className="reference-label">{populatedData.label}:</span>
          <span className="reference-value">{populatedData.value}</span>
        </div>
      </div>
    );
  };

  return (
    <BaseField label={label} required={required}>
      {isEditing ? (
        <div className="reference-input-wrapper">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-base input-monospace"
            required={required}
            disabled={disabled}
            placeholder="Enter reference ID..."
            autoFocus={isEditing}
          />
          <Search
            className="reference-search-icon"
            size={18}
            onClick={handleSearch}
          />
        </div>
      ) : (
        <ReadOnlyContent>
          {renderReferenceDisplay()}
        </ReadOnlyContent>
      )}
    </BaseField>
  );
}