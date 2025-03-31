"use client";
import React, { useState } from "react";
import { ContactFields } from "./ContactFields";
import Button from "@/components/common/Button";
import { Save, X } from "lucide-react";
import { LoadingSpinner } from "../loadingSpinner";
import { toast } from "sonner";
import { createDocument } from "@/app/actions/crudActions";

interface ContactModalContentProps {
  data: {
    initialData?: any;
    callback?: (contactId: string, displayName: string) => void;
  };
  onClose: () => void;
}

export function ContactModalContent({ data, onClose }: ContactModalContentProps) {
  const { initialData = {}, callback } = data || {};
  
  // Create a blank contact with default role="guest"
  const [contact, setContact] = useState<any>({
    ...initialData,
    general: {
      ...initialData.general,
      role: initialData.general?.role || "guest",
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [areAllFieldsLoaded, setAreAllFieldsLoaded] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!contact.general?.firstName || !contact.general?.lastName) {
        toast.error("First name and last name are required");
        setIsSubmitting(false);
        return;
      }

      // Format entity name/label if not set
      if (!contact.entityName) {
        contact.entityName = `${contact.general.firstName} ${contact.general.lastName}`;
      }
      if (!contact.entityLabel) {
        contact.entityLabel = contact.entityName;
      }

      // Create the contact
      const result = await createDocument("contacts", contact);
      
      if (result.success && result.data) {
        toast.success("Contact created successfully");
        
        // Call the callback if provided
        if (callback) {
          callback(
            result.data._id.toString(),
            `${contact.general.firstName} ${contact.general.lastName}`
          );
        }
        
        // Close the modal
        onClose();
      } else {
        toast.error(`Failed to create contact: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-modal-content">
      <LoadingSpinner isLoading={isFormLoading} />
      
      <div className="contact-fields-container">
        <ContactFields
          selectedItem={contact}
          isEditing={true}
          pendingChanges={pendingChanges}
          setPendingChanges={setPendingChanges}
          onLoadingChange={setIsFormLoading}
          onAllFieldsLoadedChange={setAreAllFieldsLoaded}
        />
      </div>
      
      <div className="modal-footer">
        <Button 
          intent="secondary" 
          icon={X} 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          icon={Save} 
          onClick={handleSave}
          disabled={isSubmitting || isFormLoading || !areAllFieldsLoaded}
          isLoading={isSubmitting}
        >
          Create Contact
        </Button>
      </div>
      
      <style jsx>{`
        .contact-modal-content {
          display: flex;
          flex-direction: column;
        }
        
        .contact-fields-container {
          display: flex;
          flex-wrap: wrap;
        }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e0e0e0;
        }
      `}</style>
    </div>
  );
}