"use client";
import { useState } from "react";
import { useContactsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { ContactFields } from "./ContactFields";

export function ContactForm() {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(true);
  const contactsContext = useContactsData();

  // Function to get display name for the item
  const getDisplayName = (item: any) => {
    return item.general?.firstName && item.general?.lastName
      ? `${item.general.firstName} ${item.general.lastName}`
      : "this contact";
  };

  return (
    <CommonForm
      dataContext={contactsContext}
      itemName="Contact"
      entityType="contact"
      basePath="contacts"
      displayName={getDisplayName}
      isFormLoading={isFormLoading}
      isAllFieldsLoaded={() => areAllFieldsLoaded}
    >
      <ContactFields
        selectedItem={contactsContext.selectedItem}
        isEditing={contactsContext.isEditing}
        pendingChanges={contactsContext.pendingChanges}
        setPendingChanges={contactsContext.setPendingChanges}
        onLoadingChange={setIsFormLoading}
        onAllFieldsLoadedChange={setAreAllFieldsLoaded}
      />
    </CommonForm>
  );
}