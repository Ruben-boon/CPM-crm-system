import React, { useMemo } from 'react';

interface CalculatedDateFieldProps {
  label: string;
  dates: string[];
  mode: 'earliest' | 'latest';
  className?: string;
}

export function CalculatedDateField({
  label,
  dates = [],
  mode,
  className = "",
}: CalculatedDateFieldProps) {

  const calculatedDate = useMemo(() => {

    const validDates = dates
      .filter(d => d && !isNaN(new Date(d).getTime()))
      .map(d => new Date(d));

    if (validDates.length === 0) {
      return null;
    }

    const timestamps = validDates.map(d => d.getTime());

    let resultTimestamp;
    if (mode === 'earliest') {
      resultTimestamp = Math.min(...timestamps);
    } else {
      resultTimestamp = Math.max(...timestamps);
    }

    return new Date(resultTimestamp);
  }, [dates, mode]);


  const displayValue = useMemo(() => {
    if (!calculatedDate) {
      return "-";
    }
    
    try {
        return calculatedDate.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch (error) {
        return "Invalid Date";
    }
  }, [calculatedDate]);

  return (
    <div className={`form-field ${className}`}>
      <label className="field-label">{label}</label>
      <input
        type="text"
        value={displayValue}
        readOnly
        className="input-base input-readonly"
      />
       <style jsx>{`
        .input-readonly {
          background-color: #f9fafb;
          cursor: default;
          color: #111827; /* Darker text for better readability */
        }
      `}</style>
    </div>
  );
}
