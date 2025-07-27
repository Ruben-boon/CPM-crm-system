// components/common/UnsavedChangesModal.tsx
"use client";
import React from 'react';
import Button from '@/components/common/Button';
import { Save, X, AlertTriangle } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onCancel: () => void; // User decides to stay on the page
  onDiscard: () => void; // User wants to leave and lose changes
  onSave: () => void; // User wants to save and then leave
  isSaving?: boolean; // To show a loading state on the save button
}

export function UnsavedChangesModal({
  isOpen,
  onCancel,
  onDiscard,
  onSave,
  isSaving = false,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <AlertTriangle size={22} className="inline-icon text-amber-500" />
            Unsaved Changes
          </h2>
        </div>
        
        <div className="modal-content">
          <p>You have unsaved changes. What would you like to do?</p>
        </div>
        
        <div className="modal-footer">
          <Button 
            intent="secondary" 
            onClick={onCancel}
            disabled={isSaving}
          >
            Stay on Page
          </Button>
          <Button
            intent="danger"
            onClick={onDiscard}
            disabled={isSaving}
          >
            Discard Changes
          </Button>
          <Button 
            icon={Save} 
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .inline-icon {
          display: inline-block;
          margin-right: 8px;
          vertical-align: middle;
        }
        .text-amber-500 {
          color: #f59e0b;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }
        .modal-footer button:first-child {
          margin-right: auto;
        }
      `}</style>
    </div>
  );
}