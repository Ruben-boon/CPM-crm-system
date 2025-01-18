import { useState, forwardRef, useImperativeHandle } from "react";
import DetailForm from "./DetailForm";
import DetailControls from "./DetailControls";
import DetailConfirmation from "./DetailConfirmation";
import { FormField, ChangeRecord } from "@/types/types";
import { createDocument } from "../../../Recyclebin/actions_old/create";
import { updateDocument } from "../../../Recyclebin/actions_old/update";
import { toast } from "sonner";

interface DetailHandlerProps {
  isNew: boolean;
  initialFormFields: FormField[];
  type: string;
  documentId?: string;
  onUpdateSuccess?: () => void;
  onPendingChanges?: (
    hasPending: boolean,
    changes?: Record<string, ChangeRecord>
  ) => void;
}

const DetailHandler = forwardRef<
  {
    handleSave: () => Promise<void>;
    handleDiscard: () => void;
  },
  DetailHandlerProps
>(
  (
    { isNew, initialFormFields, type, onUpdateSuccess, onPendingChanges },
    ref
  ) => {
    const [formFields, setFormFields] =
      useState<FormField[]>(initialFormFields);
    const [isBulkEditing, setIsBulkEditing] = useState(isNew);
    const [changedFields, setChangedFields] = useState<
      Record<string, ChangeRecord>
    >({});
    const [showConfirmation, setShowConfirmation] = useState(false);

    useImperativeHandle(ref, () => ({
      handleSave: async () => {
        await executeSave();
      },
      handleDiscard: () => {
        handleDiscard();
      },
    }));

    const handleFieldChange = (
      fieldId: string,
      label: string,
      oldValue: string,
      newValue: string
    ) => {
      if (oldValue === newValue) {
        const { [fieldId]: _, ...rest } = changedFields;
        setChangedFields(rest);
      } else {
        setChangedFields({
          ...changedFields,
          [fieldId]: { fieldId, label, oldValue, newValue },
        });
      }

      setFormFields((prev) =>
        prev.map((field) =>
          field.id === fieldId ? { ...field, value: newValue } : field
        )
      );

      onPendingChanges?.(true, changedFields);
    };

    const handleDiscard = () => {
      setFormFields(initialFormFields);
      setChangedFields({});
      if (!isNew) setIsBulkEditing(false);
      onPendingChanges?.(false);
      toast.info("Changes discarded", {
        description: "All changes have been reset to original values.",
      });
    };

    const handleSave = () => {
      setShowConfirmation(true);
      //pass a signal to search area to do a refresh
    };

    const executeSave = async () => {
      toast.promise(
        isNew
          ? createDocument(type, formFields)
          : updateDocument(type, formFields),
        {
          loading: "Saving changes...",
          success: (result) => {
            if (result.success) {
              setChangedFields({});
              if (!isNew) {
                setIsBulkEditing(false);
              }
              setShowConfirmation(false);
              onPendingChanges?.(false);
              onUpdateSuccess?.();
              return isNew
                ? "New entry created successfully!"
                : "Changes saved successfully!";
            }
            throw new Error(result.error || "Failed to save changes");
          },
          error: (error) => {
            console.error("Error saving:", error);
            return "Failed to save changes. Please try again.";
          },
        }
      );
    };

    const handleConfirmSave = async () => {
      await executeSave();
    };

    const handleCancelSave = () => {
      setShowConfirmation(false);
      toast("Save operation cancelled");
    };

    const toggleEditing = () => {
      if (Object.keys(changedFields).length === 0 && !isNew) {
        setIsBulkEditing(!isBulkEditing);
      } else if (Object.keys(changedFields).length > 0) {
        toast.warning("Please save or discard your changes first", {
          description: "You have unsaved changes that need to be handled.",
        });
      }
    };

    console.log("creating the following fields:", formFields);

    return (
      <div className="details-panel relative">
        <DetailControls
          isNew={isNew}
          isBulkEditing={isBulkEditing}
          hasChanges={Object.keys(changedFields).length > 0}
          onEdit={toggleEditing}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
        <DetailForm
          fields={formFields}
          isEditing={isBulkEditing}
          onChange={handleFieldChange}
        />

        {showConfirmation &&
          (isNew ? (
            <DetailConfirmation
              title="Create New Entry"
              message="Are you sure you want to create this new entry?"
              confirm="Create"
              cancel="Cancel"
              onConfirm={handleConfirmSave}
              onCancel={handleCancelSave}
            />
          ) : (
            <DetailConfirmation
              changes={changedFields}
              onConfirm={handleConfirmSave}
              onCancel={handleCancelSave}
            />
          ))}
      </div>
    );
  }
);

DetailHandler.displayName = "DetailHandler";

export default DetailHandler;
