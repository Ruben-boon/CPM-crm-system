"use client";
import { useContactsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";

const ROLE_OPTIONS = [
  { value: "booker", label: "Booker" },
  { value: "guest", label: "Guest" },
  { value: "both", label: "Both" },
];
const TITLE_OPTIONS = [
  { value: "mr", label: "Mr." },
  { value: "ms", label: "Ms." },
  { value: "mrs", label: "Mrs." },
  { value: "dr", label: "Dr." },
];

export function ContactForm() {
  const contactsContext = useContactsData();

  const getDisplayName = (item: any) => {
    const firstName = getNestedValue(item, "general.firstName") || "";
    const lastName = getNestedValue(item, "general.lastName") || "";

    return firstName && lastName ? `${firstName} ${lastName}` : "this contact";
  };

  const getNestedValue = (obj: any, path: string) => {
    if (!obj) return "";

    const parts = path.split(".");
    let current = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return "";
      current = current[part];
    }

    return current || "";
  };

  const handleFieldChange = (
    fieldPath: string,
    value: string,
    displayValue?: string
  ) => {
    contactsContext.updateField(fieldPath, value);
  };

  const isFieldChanged = (fieldPath: string) => {
    return !!contactsContext.pendingChanges[fieldPath];
  };

  return (
    <CommonForm
      dataContext={contactsContext}
      itemName="Contact"
      entityType="contact"
      basePath="contacts"
      displayName={getDisplayName}
    >
      <div className="col-half">
        <DropdownField
          label="Title"
          fieldPath="general.title"
          value={getNestedValue(contactsContext.selectedItem, "general.title")}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          options={TITLE_OPTIONS}
          isChanged={isFieldChanged("general.title")}
        />

        <TextField
          label="First Name"
          fieldPath="general.firstName"
          value={getNestedValue(
            contactsContext.selectedItem,
            "general.firstName"
          )}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          required={true}
          isChanged={isFieldChanged("general.firstName")}
        />

        <TextField
          label="Last Name"
          fieldPath="general.lastName"
          value={getNestedValue(
            contactsContext.selectedItem,
            "general.lastName"
          )}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          required={true}
          isChanged={isFieldChanged("general.lastName")}
        />

        <TextField
          label="E-mail"
          fieldPath="general.email"
          value={getNestedValue(contactsContext.selectedItem, "general.email")}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          type="email"
          isChanged={isFieldChanged("general.email")}
        />

        <TextField
          label="Phone"
          fieldPath="general.phone"
          value={getNestedValue(contactsContext.selectedItem, "general.phone")}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          type="tel"
          isChanged={isFieldChanged("general.phone")}
        />

        <DropdownField
          label="Role"
          fieldPath="general.role"
          value={getNestedValue(contactsContext.selectedItem, "general.role")}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          options={ROLE_OPTIONS}
          required={true}
          isChanged={isFieldChanged("general.role")}
        />

        <RefField
          label="Company"
          fieldPath="general.companyId"
          value={getNestedValue(
            contactsContext.selectedItem,
            "general.companyId"
          )}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          collectionName="companies"
          displayFields={["name"]}
          isChanged={isFieldChanged("general.companyId")}
          setFieldLoading={contactsContext.setFieldLoading}
        />
      </div>

      <div className="col-half">
        <TextField
          label="Remarks"
          fieldPath="general.remarks"
          value={getNestedValue(
            contactsContext.selectedItem,
            "general.remarks"
          )}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          multiline={true}
          rows={4}
          isChanged={isFieldChanged("general.remarks")}
        />
      </div>
    </CommonForm>
  );
}
