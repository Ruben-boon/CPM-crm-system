import React from "react";
import { ChangeRecord } from "@/types/types";
import Button from "../Button";
import { Check, Cross, X } from "lucide-react";

interface DetailConfirmationProps {
  changes?: Record<string, ChangeRecord>;
  title?: string;
  message?: string;
  confirm?: string;
  cancel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DetailConfirmation({
  changes,
  title = "Confirm changes",
  message,
  confirm = "Save changes",
  cancel = "Cancel",
  onConfirm,
  onCancel,
}: DetailConfirmationProps) {
  // Prevent clicks inside the dialog from bubbling up
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="detail-confirmation" onClick={onCancel}>
      <div className="confirmation-dialog" onClick={handleDialogClick}>
        <h2 className="confirmation-title">{title}</h2>

        {message && <p className="confirmation-message">{message}</p>}

        {changes && (
          <div className="changes-list">
            {Object.values(changes).map((change) => (
              <div key={change.fieldId} className="change-item">
                <p className="change-label">{change.label}</p>
                <p className="change-old">{change.oldValue || "Empty"}</p>
                <p className="change-new">{change.newValue || "Empty"}</p>
              </div>
            ))}
          </div>
        )}

        <div className="confirmation-actions">
          <Button icon={X} onClick={onCancel} intent="secondary">
            {cancel}
          </Button>
          <Button icon={Check} onClick={onConfirm}>
            {confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

