import { FormField } from "@/types/types";
import InputField from "../fields/InputField";

interface DetailFormProps {
  formFields: FormField[];
  isEditing: boolean;
  onChange: (
    fieldId: string,
    label: string,
    oldValue: string,
    newValue: string
  ) => void;
}
export default function DetailForm({
  formFields,
  isEditing,
  onChange,
}: DetailFormProps) {
  return (
    <div className="detail-group">
      {formFields.map((field) => (
        <div key={field.id}>
          <InputField
            label={field.label}
            value={field.value}
            type={field.type}
            dropdownFields={field.dropdownFields}
            isEditing={isEditing}
            populatedData={field.populatedData}
            required={field.required}
            onChange={(newValue) =>
              onChange(field.id, field.label, field.value, newValue)
            }
          />
        </div>
      ))}
    </div>
  );
}
