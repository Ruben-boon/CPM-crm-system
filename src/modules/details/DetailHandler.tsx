import { useState } from "react";
import DetailForm from "./DetailForm";
import DetailControls from "./DetailControls";
import DetailConfirmation from "./DetailConfirmation";
import { FormField, ChangeRecord } from "@/types/types";
import { createDocument } from "@/app/actions/create";

interface DetailHandlerProps {
  isNew: boolean;
  initialFormFields: FormField[];
  type: string,
}

export default function DetailHandler({
  isNew,
  initialFormFields,
  type
}: DetailHandlerProps) {
  const [formFields, setFormFields] = useState<FormField[]>(initialFormFields);
  const [isBulkEditing, setIsBulkEditing] = useState(isNew);
  const [changedFields, setChangedFields] = useState<Record<string, ChangeRecord>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFieldChange = (
    fieldId: string,
    label: string,
    oldValue: string,
    newValue: string
  ) => {
    if (oldValue === newValue) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  };

  const handleDiscard = () => {
    setFormFields(initialFormFields);
    setChangedFields({});
    if (!isNew) setIsBulkEditing(false);
    setShowConfirmation(false);
  };

  const handleSave = async () => {
    try {
      const result = await createDocument(type, formFields); 
      if (result.success) {
        setChangedFields({});
        if (!isNew) setShowConfirmation(false);
        setIsBulkEditing(false);
      } else {
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <div className="details-panel relative">
      <DetailControls
        isNew={isNew}
        isBulkEditing={isBulkEditing}
        hasChanges={Object.keys(changedFields).length > 0}
        onEdit={() => setIsBulkEditing(true)}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />

      <DetailForm
        formFields={formFields}
        isEditing={isBulkEditing}
        onChange={handleFieldChange}
      />

      {showConfirmation && (
        <DetailConfirmation
          changes={changedFields}
          onConfirm={handleSave}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
}