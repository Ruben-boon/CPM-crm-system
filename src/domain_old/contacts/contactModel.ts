export interface Contact {
    _id: string;
    general: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    currency: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface SearchableField {
    label: string;
    value: string;
    path?: string;
  }
  
  // Predefined searchable fields for contacts
  export const contactSearchableFields: SearchableField[] = [
    { label: "First name", value: "firstName", path: "general.firstName" },
    { label: "Last name", value: "lastName", path: "general.lastName" },
    { label: "Phone", value: "phone", path: "general.phone" },
    { label: "Email", value: "email", path: "general.email" },
    { label: "Currency", value: "currency" },
  ];
  
  // MongoDB projection based on searchable fields
  export const contactProjection = contactSearchableFields.reduce(
    (acc, field) => {
      if (field.path) {
        acc[field.path] = 1;
      } else {
        acc[field.value] = 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );
  
  // Function to get a field label by its value
  export const getFieldLabel = (value: string): string => {
    const field = contactSearchableFields.find(f => f.value === value);
    return field?.label || value;
  };
  
  // Type guard to check if an object is a Contact
  export const isContact = (obj: any): obj is Contact => {
    return obj 
      && obj.general 
      && typeof obj.general.firstName === 'string'
      && typeof obj.general.lastName === 'string'
      && typeof obj.general.email === 'string'
      && typeof obj.general.phone === 'string'
      && typeof obj.currency === 'string';
  };