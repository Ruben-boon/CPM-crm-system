export interface BaseDocument {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PopulatedData {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  label?: string;
  value?: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "number"
    | "url"
    | "dropdown"
    | "date"
    | "hidden"
    | "reference-array"
    | "reference";
  dropdownFields?: string[];
  required?: boolean;
  populatedData?: PopulatedData | PopulatedData[];
  path?: string;
}

export interface InputFieldProps extends Omit<FormField, "id"> {
  isEditing: boolean;
  disabled?: boolean;
  onCancel?: () => void;
  onChange?: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
}

export interface ChangeRecord {
  fieldId: string;
  label: string;
  oldValue: string;
  newValue: string;
}

// export interface Contact extends BaseDocument {
//   id?: string;
//   type?: string[];
//   company?: CompanyDetail;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   phone?: string;
//   address?: Address;
//   birthday?: Date;
//   documents?: Document[];
//   position?: string;
//   preferences?: Preferences;
//   //reference
//   bookingRef?: string;
//   booking?: BookingReference;
// }


export interface Booking extends BaseDocument {
  date: Date;
  customerName: string;
  service: string;
  status: string;
}


//references
export interface BookingReference {
  _id: string;
  confirmationNumber: string;
  status: string;
}
