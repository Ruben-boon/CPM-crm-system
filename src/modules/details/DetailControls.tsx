import React from 'react';
import { Edit, Save, X } from 'lucide-react';
import Button from '../Button';

interface DetailControlsProps {
  isNew: boolean;
  isBulkEditing: boolean;
  hasChanges: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export default function DetailControls({
  isNew,
  isBulkEditing,
  hasChanges,
  onEdit,
  onSave,
  onDiscard,
}: DetailControlsProps) {
  return (
    <div className="detail-controls">
      {!isBulkEditing && !hasChanges && (
        <Button
          variant="md"
          intent="ghost"
          icon={Edit}
          onClick={onEdit}
          disabled={isNew || hasChanges}
          className="detail-controls__edit-button"
        >
          {isBulkEditing ? "Cancel editing" : "Edit"}
        </Button>
      )}
      
      {isBulkEditing && hasChanges && (
        <div className="detail-controls__button-group">
          <Button 
            variant="md" 
            intent="secondary"
            icon={X}
            onClick={onDiscard}
            className="detail-controls__discard-button"
          >
            {isNew ? "Clear input fields" : "Discard changes"}
          </Button>
          
          <Button
            variant="md"
            icon={Save}
            onClick={onSave}
            className="detail-controls__save-button"
          >
            {isNew ? "Create database entry" : "Save changes"}
          </Button>
        </div>
      )}
    </div>
  );
}