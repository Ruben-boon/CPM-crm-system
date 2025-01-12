import { FormField } from "@/types/types";

export interface Contact {
  _id: string;
  general: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  currency: string;
}

export interface SearchableField {
  label: string;
  value: string;
  path?: string;
}
export const contactSearchableFields: SearchableField[] = [
  { label: "First name", value: "firstName", path: "general.firstName" },
  { label: "Last name", value: "lastName", path: "general.lastName" },
  { label: "Phone", value: "phone", path: "general.phone" },
  { label: "Email", value: "email", path: "general.email" },
  { label: "Currency", value: "currency" }, // top-level field doesn't need path
];
// mimic contactSearchFields for better efficient search
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

//work in progress not used yet
export const thumbnailFields = {
  header: "general.firstName",
  fields: ["general.email", "general.phone"],
};

// Function to build a query for searching Contacts
export function buildContactQuery(
  searchField: string,
  searchTerm: string
): Record<string, any> {
  // Find the field configuration
  const fieldConfig = contactSearchableFields.find(
    (f) => f.value === searchField
  );
  if (!fieldConfig) {
    throw new Error(`Invalid search field: ${searchField}`);
  }
  // Use the path if specified, otherwise use the value directly
  const queryField = fieldConfig.path || fieldConfig.value;
  return {
    [queryField]: { $regex: searchTerm, $options: "i" },
  };
}

// Implement a function to get nested value from an object using dot notation
export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}
// Updated contact fields function
export const contactFields = (detailData: any): FormField[] => {
  const fields: FormField[] = [
    { id: "objectId", type: "hidden", value: detailData._id },
    {
      id: "firstName",
      label: "First Name",
      value: getNestedValue(detailData, "general.firstName") || "",
      required: true,
      type: "text",
      path: "general.firstName",
    },
    {
      id: "lastName",
      label: "Last Name",
      value: getNestedValue(detailData, "general.lastName") || "",
      required: true,
      type: "text",
      path: "general.lastName",
    },
    {
      id: "email",
      label: "Email",
      value: getNestedValue(detailData, "general.email") || "",
      required: true,
      type: "text",
      path: "general.email",
    },
    {
      id: "phone",
      label: "Phone",
      value: getNestedValue(detailData, "general.phone") || "",
      required: true,
      type: "text",
      path: "general.phone",
    },
    {
      id: "currency",
      label: "Currency",
      value: detailData?.currency || "",
      required: true,
      type: "dropdown",
      dropdownFields: ["EUR", "USD", "GBP"],
      path: "currency",
    },
  ];

  return fields;
};
