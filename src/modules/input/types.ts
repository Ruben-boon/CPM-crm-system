export interface ReferenceData {
    label: string;
    value: string;
  }
  
  export interface InputFieldProps {
    label: string;
    value: string | string[];
    onSave?: (value: string) => Promise<void>;
    isEditing: boolean;
    type?: string;
    dropdownFields?: string[];
    required?: boolean;
    disabled?: boolean;
    onCancel?: () => void;
    onChange?: (value: string) => void;
    populatedData?: ReferenceData | ReferenceData[];
  }