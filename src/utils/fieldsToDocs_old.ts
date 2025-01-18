import { FormField } from "@/types/types";

export function formFieldsToDocument(
  formFields: FormField[]
): Record<string, any> {
  const document: Record<string, any> = {};

  formFields.forEach((field) => {
    const { id, value, type: fieldType } = field;

    if (id.includes(".")) {
      // Handle nested fields (e.g., "company.name")
      const [parent, child] = id.split(".");
      if (!document[parent]) {
        document[parent] = {};
      }
      document[parent][child] = value;
    } else {
      // Handle top-level fields with type conversion
      switch (fieldType) {
        case "date":
          document[id] = value ? new Date(value) : null;
          break;
        case "number":
          document[id] = value ? parseFloat(value) : null;
          break;
        default:
          document[id] = value;
      }
    }
  });

  return document;
}
