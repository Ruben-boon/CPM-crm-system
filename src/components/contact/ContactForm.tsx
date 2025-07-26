"use client";
import { useContactsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { RelatedItems } from "../fields/RelatedItems";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ROLE_OPTIONS = [
  { value: "booker", label: "Booker" },
  { value: "guest", label: "Guest" },
  { value: "supplierContact", label: "Supplier contact" },
  { value: "both", label: "Booker and Guest" },
];
const TITLE_OPTIONS = [
  { value: "mr", label: "Mr." },
  { value: "ms", label: "Ms." },
  { value: "mrs", label: "Mrs." },
  { value: "dr", label: "Dr." },
];

export function ContactForm() {
  const contactsContext = useContactsData();
  const router = useRouter();

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
    console.log(`[ContactForm] Field changed: ${fieldPath} = ${value}`);
    contactsContext.updateField(fieldPath, value);
  };

  const isFieldChanged = (fieldPath: string) => {
    return !!contactsContext.pendingChanges[fieldPath];
  };

  const handleRelationClick = (itemId: string, collection: string) => {
    console.log(`[ContactForm] Relation clicked: ${collection}/${itemId}`);
    router.push(`/${collection}/${itemId}`);
  };

  const contactRole = getNestedValue(
    contactsContext.selectedItem,
    "general.role"
  );
  const isGuest = contactRole === "guest" || contactRole === "both";
  const isBooker = contactRole === "booker" || contactRole === "both";
  const isSupplierContact = contactRole === "supplierContact";

  // Only show related sections when viewing (not editing) and when the contact has an ID
  const shouldShowRelatedSections =
    contactsContext.selectedItem?._id && !contactsContext.isEditing;

  console.log(`[ContactForm] Render state:`, {
    contactId: contactsContext.selectedItem?._id,
    isEditing: contactsContext.isEditing,
    isGuest,
    isBooker,
    shouldShowRelatedSections,
  });

  return (
    <CommonForm
      dataContext={contactsContext}
      itemName="Contact"
      entityType="contact"
      basePath="contacts"
      displayName={getDisplayName}
    >
      <div className="col-half">
        {/* <DropdownField
          label="Title"
          fieldPath="general.title"
          value={getNestedValue(contactsContext.selectedItem, "general.title")}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          options={TITLE_OPTIONS}
          isChanged={isFieldChanged("general.title")}
        /> */}

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

        <TextField
          label="Address"
          fieldPath="general.address"
          value={getNestedValue(
            contactsContext.selectedItem,
            "general.address"
          )}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          isChanged={isFieldChanged("general.address")}
        />

        <TextField
          label="Postal Code"
          fieldPath="general.postalCode"
          value={getNestedValue(
            contactsContext.selectedItem,
            "general.postalCode"
          )}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          isChanged={isFieldChanged("general.postalCode")}
        />

        <TextField
          label="City"
          fieldPath="general.city"
          value={getNestedValue(contactsContext.selectedItem, "general.city")}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          isChanged={isFieldChanged("general.city")}
        />

        <TextField
          label="Country"
          fieldPath="general.country"
          value={getNestedValue(
            contactsContext.selectedItem,
            "general.country"
          )}
          onChange={handleFieldChange}
          isEditing={contactsContext.isEditing}
          isChanged={isFieldChanged("general.country")}
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
        {isSupplierContact && (
          <RefField
            label="Supplier Hotel"
            fieldPath="general.hotelId"
            value={getNestedValue(
              contactsContext.selectedItem,
              "general.hotelId"
            )}
            onChange={handleFieldChange}
            isEditing={contactsContext.isEditing}
            collectionName="hotels"
            displayFields={["name"]}
            isChanged={isFieldChanged("general.hotelId")}
            setFieldLoading={contactsContext.setFieldLoading}
          />
        )}
      </div>

      <div className="col-half">
        {console.log(
          `[ContactForm] Rendering RefField - companyId: ${getNestedValue(
            contactsContext.selectedItem,
            "general.companyId"
          )}`
        )}

        <RefField
          label="Company"
          fieldPath="general.companyId"
          nameFieldPath="general.companyName" // <-- ADD THIS LINE
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
          required={true}
        />
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

        {shouldShowRelatedSections && isGuest && (
          <div className="related-section">
            <RelatedItems
              key={`stays-${contactsContext.selectedItem._id}`}
              id={contactsContext.selectedItem._id}
              referenceField="guestIds"
              collectionName="stays"
              displayFields={[
                { path: "hotelName" },
                { path: "checkInDate", label: "Stay Period" },
                { path: "checkOutDate" },
              ]}
              title="Stays as Guest"
              emptyMessage="No stays found for this contact"
              onItemClick={handleRelationClick}
              isFormEditing={contactsContext.isEditing}
            />
          </div>
        )}
      </div>
      <div className="col-full">
        {shouldShowRelatedSections && isBooker && (
          <div className="related-section">
            <RelatedItems
              key={`bookings-${contactsContext.selectedItem._id}`}
              id={contactsContext.selectedItem._id}
              referenceField="bookerId"
              collectionName="bookings"
              displayFields={[
                { path: "confirmationNo" },
                { path: "travelPeriodStart", label: "Travel Period" },
                { path: "travelPeriodEnd" },
              ]}
              title="Bookings as Booker"
              emptyMessage="No bookings found where this contact is the booker"
              onItemClick={handleRelationClick}
              isFormEditing={contactsContext.isEditing}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .related-section {
          margin-top: 24px;
        }
      `}</style>
    </CommonForm>
  );
}
