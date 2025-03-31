"use client";
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { CommonForm } from "../common/CommonForm";
import { ContactFields } from "./ContactFields";

interface ContactFormProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

export function ContactForm({ onLoadingChange }: ContactFormProps) {
  const [isFieldLoading, setIsFieldLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(true);
  const contactsContext = useContactsData();

  // Propagate loading changes to parent if callback exists
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isFieldLoading);
    }
  }, [isFieldLoading, onLoadingChange]);

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
      isFormLoading={isFieldLoading}
      isAllFieldsLoaded={() => areAllFieldsLoaded}
    >
      <ContactFields
        selectedItem={contactsContext.selectedItem}
        isEditing={contactsContext.isEditing}
        pendingChanges={contactsContext.pendingChanges}
        setPendingChanges={contactsContext.setPendingChanges}
        onLoadingChange={(loading) => setIsFieldLoading(loading)}
        onAllFieldsLoadedChange={setAreAllFieldsLoaded}
      />
    </CommonForm>
  );
}