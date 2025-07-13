import React from 'react';
import Button from '@/components/common/Button';
import { Save, X, AlertTriangle, ArrowRight } from 'lucide-react';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onCancel: () => void; // User decides to stay on the page
  onDiscard: () => void; // User wants to leave and lose changes
  onSave: () => void; // User wants to save and then leave
  isSaving: boolean; // To show a loading state on the save button
}

/**
 * A modal that asks the user what to do with unsaved changes before navigating away.
 */
export function UnsavedChangesDialog({
  isOpen,
  onCancel,
  onDiscard,
  onSave,
  isSaving,
}: UnsavedChangesDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <AlertTriangle size={22} className="inline-block mr-2 text-amber-500" />
            Unsaved Changes
          </h2>
          <button className="close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-content">
          <p className="text-gray-600">
            You have unsaved changes. Do you want to save them before leaving?
          </p>
        </div>
        <div className="confirmation-actions" style={{ justifyContent: 'space-between', display: 'flex', width: '100%' }}>
          <Button 
            intent="secondary" 
            icon={X} 
            onClick={onCancel}
            disabled={isSaving}
          >
            Stay on Page
          </Button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              intent="danger"
              icon={ArrowRight}
              onClick={onDiscard}
              disabled={isSaving}
            >
              Discard & Leave
            </Button>
            <Button 
              icon={Save} 
              onClick={onSave}
              isLoading={isSaving}
              disabled={isSaving}
            >
              Save & Leave
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
