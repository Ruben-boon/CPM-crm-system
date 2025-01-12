"use client";
import { useState, useEffect } from "react";
import InputField from "./InputField";
import { FormField } from "@/types/types";
import { createDocument } from "@/app/actions/create";

// this component needs to be split further

interface ChangeRecord {
  fieldId: string;
  label: string;
  oldValue: string;
  newValue: string;
}

interface DetailsPanelProps {
  isNew?: boolean;
  initialFormFields: FormField[];
  type: string;
}

export default function DetailsPanel({
  isNew = false,
  initialFormFields,
  type,
}: DetailsPanelProps) {
  const [formFields, setFormFields] = useState<FormField[]>(initialFormFields);
  const [isBulkEditing, setIsBulkEditing] = useState(isNew);
  const [changedFields, setChangedFields] = useState<
    Record<string, ChangeRecord>
  >({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  console.log(initialFormFields);
  useEffect(() => {
    setFormFields(initialFormFields);
    setChangedFields({});
    setIsBulkEditing(isNew);
    setShowConfirmation(false);
  }, [initialFormFields, isNew]);

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
  };

  const handleDiscardChanges = () => {
    setFormFields(initialFormFields);
    setChangedFields({});
    if (!isNew) setIsBulkEditing(false);
    setShowConfirmation(false);
  };

  const handleSaveChanges = async () => {
    try {
      const result = await createDocument(type, formFields);
      if (result.success) {
        setChangedFields({});
        if (!isNew) setShowConfirmation(false);
        setIsBulkEditing(false);
        // Handle success (maybe show a notification or redirect)
      } else {
        // Handle error
        console.error(result.error);
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  return (
    <div className="details-panel relative">
      {/* Bulk Edit Controls */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setIsBulkEditing(!isBulkEditing)}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          disabled={isNew || Object.keys(changedFields).length > 0}
        >
          {isBulkEditing ? "Beëindig Bewerken" : "Bewerk Alles"}
        </button>

        {isBulkEditing && Object.keys(changedFields).length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleDiscardChanges}
              className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Wijzigingen Annuleren
            </button>
            <button
              onClick={
                isNew ? handleSaveChanges : () => setShowConfirmation(true)
              }
              className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Wijzigingen Opslaan
            </button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="detail-group">
        <h4 className="detail-group__title">Klant informatie</h4>
        {formFields.map((field) => {
          const isChanged = Boolean(changedFields[field.id]);
          return (
            <div
              key={field.id}
              className={`transition-all duration-200 ${
                isChanged ? "bg-blue-50 rounded-lg p-2" : ""
              }`}
            >
              <InputField
                label={field.label}
                value={field.value}
                type={field.type}
                dropdownFields={field.dropdownFields}
                onSave={async (value) => {
                  console.log("Saving:", value);
                }}
                isEditing={isNew || isBulkEditing}
                required={field.required}
                onChange={(newValue) =>
                  handleFieldChange(
                    field.id,
                    field.label,
                    initialFormFields.find((f) => f.id === field.id)?.value ||
                      "",
                    newValue
                  )
                }
                onCancel={() => {
                  const initialValue =
                    initialFormFields.find((f) => f.id === field.id)?.value ||
                    "";
                  handleFieldChange(
                    field.id,
                    field.label,
                    changedFields[field.id]?.newValue || "",
                    initialValue
                  );
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal (only for non-new entities) */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Bevestig Wijzigingen</h2>
            <div className="max-h-96 overflow-y-auto">
              <h3 className="font-semibold mb-2">
                De volgende velden zijn gewijzigd:
              </h3>
              <div className="space-y-2">
                {Object.values(changedFields).map((change) => (
                  <div key={change.fieldId} className="p-2 bg-gray-50 rounded">
                    <p className="font-medium">{change.label}</p>
                    <p className="text-red-500 line-through">
                      {change.oldValue}
                    </p>
                    <p className="text-green-500">{change.newValue}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={handleDiscardChanges}
                className="rounded-md bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveChanges}
                className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
              >
                Bevestig Wijzigingen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
