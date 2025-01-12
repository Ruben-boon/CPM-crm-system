import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ReferenceData } from './types';


interface ReferenceDisplayProps {
  type: string;
  value: string | string[];
  populatedData?: ReferenceData | ReferenceData[];
}

export const ReferenceDisplay: React.FC<ReferenceDisplayProps> = ({
  type,
  value,
  populatedData
}) => {
  if (type === "reference-array") {
    if (!Array.isArray(populatedData) || populatedData.length === 0) {
      return <span className="empty-state">No bookings</span>;
    }

    return (
      <div className="reference-container">
        {populatedData.map((item, index) => (
          <div key={index} className="reference-item">
            <div>
              <div>
                <span>Reference ID:</span>
                <span className="reference-id">
                  {Array.isArray(value) ? value[index] : '-'}
                </span>
              </div>
              <div className="reference-link">
                <ExternalLink size={14} />
                <span>{item.label}:</span>
                <span className="reference-value">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!populatedData) {
    return <span className="empty-state">No bookings</span>;
  }

  const data = populatedData as ReferenceData;
  return (
    <div className="reference-container">
      <div>
        <span>Reference ID:</span>
        <span className="reference-id">{value || "-"}</span>
      </div>
      <div className="reference-link">
        <ExternalLink size={14} />
        <span>{data.label}:</span>
        <span className="reference-value">{data.value}</span>
      </div>
    </div>
  );
};