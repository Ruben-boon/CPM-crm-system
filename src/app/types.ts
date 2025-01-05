//for all types that are used in more then 1 component

export interface FormField {
  id: string;
  label: string;
  value: string;
  type?: "text" | "email" | "tel" | "number" | "url";
  required?: boolean;
}
