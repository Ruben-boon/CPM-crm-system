import Button from "@/components/common/Button";
import { contactFormFields } from "@/store/contactSchema";
import { useContactStore } from "@/store/contactsStore";
import { Save, X, Edit } from "lucide-react";
import { useState, useEffect } from "react";

interface ContactFormProps {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isDirty: boolean;
  handleChange: (field: string, value: string) => void;
  handleBlur: (field: string) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onChangedFieldsUpdate: (
    changedFields: Array<{ label: string; oldValue: string; newValue: string }>
  ) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ContactForm({
  values,
  errors,
  touched,
  isSubmitting,
  isDirty,
  handleChange,
  handleBlur,
  onDirtyChange,
  onChangedFieldsUpdate,
  onSave,
  onCancel,
}: ContactFormProps) {
  const { selectedContact } = useContactStore();
  const [isEditMode, setIsEditMode] = useState(false);

  // Effect to sync isDirty state with parent
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  // When selectedContact changes, reset edit mode
  useEffect(() => {
    if (!selectedContact?._id) {
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
    }
  }, [selectedContact?._id]);

  // Get changed fields for tracking modifications
  const getChangedFields = () => {
    return Object.entries(values)
      .map(([fieldId, newValue]) => {
        const originalValue = selectedContact
          ? fieldId.split(".").reduce((obj, key) => obj?.[key], selectedContact)
          : "";

        if (newValue !== originalValue) {
          const field = contactFormFields[fieldId];
          return {
            label: field?.label || fieldId,
            oldValue: originalValue as string,
            newValue: newValue as string,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  // Effect to update changed fields
  useEffect(() => {
    if (isDirty) {
      const changes = getChangedFields();
      onChangedFieldsUpdate(changes);
    }
  }, [values, isDirty, onChangedFieldsUpdate]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave();
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    onCancel();
    setIsEditMode(false);
  };

  const renderField = (id: string, field: any) => {
    const hasError = touched[id] && errors[id];
    const isDisabled = !isEditMode;

    switch (field.type) {
      case "select":
        return (
          <div key={id} className="form-field">
            <label className="field-label">
              {field.label}
              {field.required && <span className="required-mark">*</span>}
            </label>
            <select
              className={`input-base input-style ${
                hasError ? "input-error" : ""
              }`}
              value={values[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
              onBlur={() => handleBlur(id)}
              required={field.required}
              disabled={isDisabled}
            >
              <option value="">Select {field.label}</option>
              {field.options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {hasError && <div className="error-message">{errors[id]}</div>}
          </div>
        );

      default:
        return (
          <div key={id} className="form-field">
            <label className="field-label">
              {field.label}
              {field.required && <span className="required-mark"> *</span>}
            </label>
            <input
              type={field.type}
              className={`input-base input-style ${
                hasError ? "input-error" : ""
              }`}
              value={values[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
              onBlur={() => handleBlur(id)}
              required={field.required}
              disabled={isDisabled}
            />
            {hasError && <div className="error-message">{errors[id]}</div>}
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="contact-form">
      <div className="form-header">
        <h2 className="form-title">
          {selectedContact?._id ? "Contact Details" : "New Contact"}
        </h2>
        <div className="form-actions">
          {!isEditMode && selectedContact?._id && (
            <Button icon={Edit} onClick={handleEdit}>
              Edit
            </Button>
          )}

          {isEditMode && (
            <>
              <Button
                icon={Save}
                type="submit"
                disabled={isSubmitting || !isDirty}
              >
                Save
              </Button>

              <Button
                intent="secondary"
                icon={X}
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="form-sections">
        <div className="form-section">
          <h3 className="section-title">General Information</h3>
          <div className="section-fields">
            {Object.entries(contactFormFields)
              .filter(([id]) => id.startsWith("general."))
              .map(([id, field]) => renderField(id, field))}
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          <div className="section-fields">
            {Object.entries(contactFormFields)
              .filter(([id]) => !id.startsWith("general."))
              .map(([id, field]) => renderField(id, field))}
          </div>
        </div>
      </div>
    </form>
  );
}
