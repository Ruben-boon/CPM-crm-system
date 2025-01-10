export interface DetailsPanelProps {
  isNew: boolean;
  schemaLayout: any;
  initialFormFields: FormField[];
  onSubmit: (formData: FormField[]) => Promise<void>;
  onDelete: () => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
}
//tf is this doing here?

export interface FormField {
  id: string;
  label: string;
  value: string;
  type: "text" | "email" | "tel" | "number" | "url" | "dropdown" | "date";
  dropdownFields?: string[];
  required?: boolean;
}

interface Document {
  [key: string]: any;  // Temporary placeholder for document structure
}

interface Preferences {
  language?: string;
  communicationChannel?: string;
}

interface CompanyDetail {
  buffer?: string | Buffer;
  name?: string;
  vatNumber?: string;
  entity?: string;
  entityAddress?: string;
  currency?: string[];
}

interface Address {
  street?: string;
  houseNumber?: string;
  zipCode?: string;
  country?: string;
}

export type Contact = {
  type?: string[];
  company?: CompanyDetail;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  birthday?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  documents?: Document[];
  id?: string;
  position?: string;
  preferences?: Preferences;
}

export type Booking = {
  date: Date;
  customerName: string;
  service: string;
  status: string;
};

export type DataTypes = {
  contacts: Contact[];
  bookings: Booking[];
};

//serializedContact type in serializers.ts
