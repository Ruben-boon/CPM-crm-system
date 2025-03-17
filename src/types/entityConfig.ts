export type FieldType = 
  | 'text'
  | 'email'
  | 'number'
  | 'tel'
  | 'date'
  | 'dropdown'
  | 'reference'
  | 'multiReference';

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;           // Field name in the database
  label: string;          // Display label
  type: FieldType;        // Field type
  required?: boolean;     // Whether the field is required
  options?: FieldOption[]; // For dropdown fields
  referenceConfig?: {
    collection: string;   // For reference fields, which collection to reference
    displayFields: string[]; // Fields to display from the referenced collection
  };
  nested?: boolean;       // Whether this field is nested (e.g., general.firstName)
  path?: string;          // Full path for nested fields (e.g., "general.firstName")
}

export interface EntityConfig {
  name: string;           // Entity name (e.g., 'contacts', 'companies')
  displayName: string;    // Display name (e.g., 'Contact', 'Company')
  pluralName: string;     // Plural display name (e.g., 'Contacts', 'Companies')
  fields: FieldConfig[];  // Field configurations
  searchFields: string[]; // Fields that can be searched
  defaultSearchField: string; // Default field to search by
  relationFields?: {
    [key: string]: {
      collection: string;
      field: string;
      displayFields: { path: string; label?: string }[];
      title: string;
      emptyMessage: string;
    };
  };
}

export interface EntityConfigs {
  [key: string]: EntityConfig;
}

// Utility function to get field display value
export const getFieldDisplayValue = (item: any, field: FieldConfig): string => {
  if (!item) return '';
  
  if (field.nested && field.path) {
    const parts = field.path.split('.');
    let value = item;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return '';
    }
    return value?.toString() || '';
  }
  
  return item[field.name]?.toString() || '';
};

// Utility function to set field value
export const setFieldValue = (item: any, field: FieldConfig, value: any): any => {
  if (field.nested && field.path) {
    const parts = field.path.split('.');
    const result = { ...item };
    let current = result;
    
    // Create nested objects if they don't exist
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the value on the innermost object
    current[parts[parts.length - 1]] = value;
    return result;
  }
  
  return { ...item, [field.name]: value };
};

// Utility function to get field value
export const getFieldValue = (item: any, field: FieldConfig): any => {
  if (!item) return '';
  
  if (field.nested && field.path) {
    const parts = field.path.split('.');
    let value = item;
    for (const part of parts) {
      value = value?.[part];
      if (value === undefined) return '';
    }
    return value;
  }
  
  return item[field.name];
};