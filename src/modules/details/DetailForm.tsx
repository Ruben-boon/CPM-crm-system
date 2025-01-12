import React from "react";
import TextField from "../fields/TextField";
import SelectField from "../fields/SelectField";
import { FormField } from "@/types/types";

interface GroupedFields {
  [key: string]: FormField[];
}

export interface PopulatedData {
  label: string;
  value: string;
}


export interface ChangeRecord {
  fieldId: string;
  label: string;
  oldValue: string;
  newValue: string;
}

interface DetailFormProps {
  fields: FormField[];
  isEditing: boolean;
  onChange: (
    fieldId: string,
    label: string,
    oldValue: string,
    newValue: string
  ) => void;
}

export default function DetailForm({
  fields,
  isEditing,
  onChange,
}: DetailFormProps) {
  const getFieldComponent = (field: FormField) => {
    const commonProps = {
      label: field.label,
      value: field.value,
      required: field.required,
      isEditing,
      onChange: (newValue: string | string[]) => {
        const stringValue = Array.isArray(newValue)
          ? newValue.join(",")
          : newValue;
        onChange(field.id, field.label, field.value, stringValue);
      },
    };

    switch (field.type) {
      case "hidden":
        return null;

      case "dropdown":
        return (
          <SelectField {...commonProps} options={field.dropdownFields || []} />
        );

      default:
        return (
          <TextField
            {...commonProps}
            type={field.type as "text" | "email" | "number" | "tel"}
          />
        );
    }
  };


  //use path property to group fields
  const groupFields = (fields: FormField[]): GroupedFields => {
    return fields.reduce((groups: GroupedFields, field) => {
      if (!field.path) {
        return {
          ...groups,
          ungrouped: [...(groups.ungrouped || []), field],
        };
      }
  
      const pathParts = field.path.split(".");
      const groupName = pathParts.length > 1 ? pathParts[0] : "ungrouped";
  
      return {
        ...groups,
        [groupName]: [...(groups[groupName] || []), field],
      };
    }, {});
  };
  
  const groupedFields = groupFields(fields);
  
  return (
    <div className="detail-form space-y-6">
      {Object.entries(groupedFields)
        .sort(([a], [b]) => (a === "ungrouped" ? 1 : b === "ungrouped" ? -1 : a.localeCompare(b)))
        .map(([groupName, groupFields]) => (
          <div
            key={groupName}
            className={
              groupName !== "ungrouped" ? "border rounded-lg p-4 bg-gray-50" : ""
            }
          >
            {groupName !== "ungrouped" && (
              <p className="text-lg font-medium capitalize mb-4">
                <strong>{groupName}</strong>
              </p>
            )}
            <div className="space-y-4">
              {groupFields.map((field) => (
                <React.Fragment key={field.id}>
                  {getFieldComponent(field)}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

// import { FormField } from "@/types/types";
// import InputField from "./InputField";

// interface DetailFormProps {
//   formFields: FormField[];
//   isEditing: boolean;
//   onChange: (
//     fieldId: string,
//     label: string,
//     oldValue: string,
//     newValue: string
//   ) => void;
// }
// export default function DetailForm({
//   formFields,
//   isEditing,
//   onChange,
// }: DetailFormProps) {
//   // console.log(formFields);
//   return (
//     <div className="detail-group">
//       {formFields.map((field) => (
//         <div key={field.id}>
//           <InputField
//             label={field.label}
//             value={field.value}
//             type={field.type}
//             dropdownFields={field.dropdownFields}
//             isEditing={isEditing}
//             populatedData={field.populatedData}
//             required={field.required}
//             onChange={(newValue) =>
//               onChange(field.id, field.label, field.value, newValue)
//             }
//           />
//         </div>
//       ))}
//     </div>
//   );
// }
