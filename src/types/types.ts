//for all types that are used in more then 1 component

export interface FormField {
  id: string;
  label: string;
  value: string;
  type: "text" | "email" | "tel" | "number" | "url" | "dropdown" ;
  dropdownFields: string[];
  required?: boolean;
}

export type Contact = {
  type: string[];
  company: {
    name: string;
    vatNumber: string;
    entity: string;
    entityAddress: string;
    currency: string[];
  };
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    street: string;
    houseNumber: string;
    zipCode: string;
    country: string;
  };
  birthday: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Booking = {
  date: Date;
  customerName: string;
  service: string;
  status: string;
  // ... other booking fields
};

// Add more types as needed
export type DataTypes = {
  contacts: Contact[];
  bookings: Booking[];
  // Add more data types here
};
