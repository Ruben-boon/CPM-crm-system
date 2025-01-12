import React from 'react';
import BaseField, { ReadOnlyContent } from './BaseField';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'number' | 'tel';
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
}

export default function TextField({
  label,
  value = '',
  onChange,
  type = 'text',
  required,
  disabled,
  isEditing
}: TextFieldProps) {
  // Ensure onChange is defined before using it
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <BaseField label={label} required={required}>
      {isEditing ? (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="input-base"
          required={required}
          disabled={disabled}
          autoFocus={isEditing}
        />
      ) : (
        <ReadOnlyContent>{value}</ReadOnlyContent>
      )}
    </BaseField>
  );
}
