import React from 'react';
import BaseField, { ReadOnlyContent } from './BaseField';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  disabled?: boolean;
  isEditing?: boolean;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  disabled,
  isEditing
}: SelectFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <BaseField label={label} required={required}>
      {isEditing ? (
        <select
          value={value}
          onChange={handleChange}
          className="input-base"
          required={required}
          disabled={disabled}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <ReadOnlyContent>{value}</ReadOnlyContent>
      )}
    </BaseField>
  );
}