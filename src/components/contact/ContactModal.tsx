"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/common/Button";
import { Save, X } from "lucide-react";
import { LoadingSpinner } from "../loadingSpinner";
import { toast } from "sonner";
import { createDocument } from "@/app/actions/crudActions";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";

interface ContactModalProps {
  initialData?: any;
  callback?: (contactId: string, displayName: string) => void;
  onClose: () => void;
}

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

export function ContactModal({ initialData = {}, callback, onClose }: ContactModalProps) {
  // Create a blank contact with default role="guest"
  const [contact, setContact] = useState<any>({
    general: {
      role: "guest",
      ...initialData.general,
    },
    ...initialData
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, any>>({});
  const [fieldLoadingStates, setFieldLoadingStates] = useState<Record<string, boolean>>({});

  // Function to check if any fields are loading
  const isAnyFieldLoading = () => {
    return Object.values(fieldLoadingStates).some(isLoading => isLoading);
  };

  // Update loading state when field loading state changes
  useEffect(() => {
    setIsFormLoading(isAnyFieldLoading());
  }, []);

  const setFieldLoading = (fieldPath: string, isLoading: boolean) => {
    setFieldLoadingStates(prev => ({
      ...prev,
      [fieldPath]: isLoading
    }));
  };

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
  const handleFieldChange = (fieldPath: string, value: any) => {
    // Create a deep copy of the contact
    const updatedContact = JSON.parse(JSON.stringify(contact));
    
    // Handle nested fields (e.g., "general.firstName")
    const fieldParts = fieldPath.split('.');
    
    if (fieldParts.length === 1) {
      // Direct field update
      updatedContact[fieldPath] = value;
    } else {
      // Nested field update
      let current = updatedContact;
      for (let i = 0; i < fieldParts.length - 1; i++) {
        const part = fieldParts[i];
        if (!current[part]) current[part] = {};
        current = current[part];
      }
      current[fieldParts[fieldParts.length - 1]] = value;
    }
    
    // Update contact state
    setContact(updatedContact);
    
    // Track the change in pendingChanges
    setPendingChanges(prev => ({
      ...prev,
      [fieldPath]: value
    }));

    // If it's a reference field, mark it as loading
    if (fieldPath.endsWith('Id')) {
      setFieldLoading(fieldPath, true);
    }
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

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Add Contact</h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-content">
          <LoadingSpinner isLoading={isFormLoading} />
          
          <div className="contact-fields-container">
            <div className="col-half">
              <DropdownField
                label="Title"
                fieldPath="general.title"
                value={getNestedValue(contact, "general.title")}
                onChange={handleFieldChange}
                isEditing={true}
                options={TITLE_OPTIONS}
              />

              <TextField
                label="First Name"
                fieldPath="general.firstName"
                value={getNestedValue(contact, "general.firstName")}
                onChange={handleFieldChange}
                isEditing={true}
                required={true}
              />

              <TextField
                label="Last Name"
                fieldPath="general.lastName"
                value={getNestedValue(contact, "general.lastName")}
                onChange={handleFieldChange}
                isEditing={true}
                required={true}
              />

              <TextField
                label="E-mail"
                fieldPath="general.email"
                value={getNestedValue(contact, "general.email")}
                onChange={handleFieldChange}
                isEditing={true}
                type="email"
              />

              <TextField
                label="Phone"
                fieldPath="general.phone"
                value={getNestedValue(contact, "general.phone")}
                onChange={handleFieldChange}
                isEditing={true}
                type="tel"
              />

              <DropdownField
                label="Role"
                fieldPath="general.role"
                value={getNestedValue(contact, "general.role")}
                onChange={handleFieldChange}
                isEditing={true}
                options={ROLE_OPTIONS}
                required={true}
              />
            </div>

            <div className="col-half">
              <RefField
                label="Company"
                fieldPath="general.companyId"
                value={getNestedValue(contact, "general.companyId")}
                onChange={handleFieldChange}
                isEditing={true}
                collectionName="companies"
                displayFields={["name"]}
                setFieldLoading={setFieldLoading}
              />
            
              <TextField
                label="Remarks"
                fieldPath="general.remarks"
                value={getNestedValue(contact, "general.remarks")}
                onChange={handleFieldChange}
                isEditing={true}
                multiline={true}
                rows={4}
              />
            </div>
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
              disabled={isSubmitting || isFormLoading}
              isLoading={isSubmitting}
            >
              Create Contact
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}