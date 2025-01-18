import React from "react";
import Button from "@/components/common/Button";
import { Save, X } from "lucide-react";

interface ChangeItem {
  label: string;
  oldValue: string | undefined;
  newValue: string | undefined;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  changes?: ChangeItem[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  changes,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="detail-confirmation" onClick={onCancel}>
      <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirmation-title">{title}</h2>
        <p className="confirmation-message">{message}</p>

        {changes && changes.length > 0 && (
          <div className="changes-list">
            {changes.map((change, index) => (
              <div key={index} className="change-item">
                <p className="change-label">{change.label}</p>
                <p className="change-old">{change.oldValue || "Empty"}</p>
                <p className="change-new">{change.newValue || "Empty"}</p>
              </div>
            ))}
          </div>
        )}

        <div className="confirmation-actions">
          <Button intent="secondary" icon={X} onClick={onCancel}>
            Discard changes
          </Button>
          <Button icon={Save} onClick={onConfirm}>
            Save changes
          </Button>
        </div>
      </div>
    </div>
  );
}
