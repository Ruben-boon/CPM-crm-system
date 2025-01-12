export interface PopulatedData {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label?: string;  
  value: string;
  type:
    | "text"
    | "email"
    | "number"
    | "tel"
    | "hidden"
    | "dropdown"
    | "reference"
    | "reference-array";
  required?: boolean;
  dropdownFields?: string[];
  populatedData?: PopulatedData | PopulatedData[];
  path?:string;
}

export interface ChangeRecord {
  fieldId: string;
  label: string;
  oldValue: string;
  newValue: string;
}
export interface InputFieldProps extends Omit<FormField, "id"> {
  isEditing: boolean;
  disabled?: boolean;
  onCancel?: () => void;
  onChange?: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
}
