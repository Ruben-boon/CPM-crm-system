import React, { useState } from "react";
import Button from "@/components/common/Button";
import { Save, X } from "lucide-react";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { toast } from "sonner";

// Create document action import
import { createDocument } from "@/app/actions/crudActions";

interface QuickAddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated: (contactId: string, displayName: string) => void;
}

interface QuickContactFormData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  remarks: string;
}

const INITIAL_FORM_STATE: QuickContactFormData = {
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  remarks: "",
};

const TITLE_OPTIONS = [
  { value: "mr", label: "Mr." },
  { value: "ms", label: "Ms." },
];

export function QuickAddContactModal({
  isOpen,
  onClose,
  onContactCreated,
}: QuickAddContactModalProps) {
  const [formData, setFormData] = useState<QuickContactFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof QuickContactFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);

    try {
      // Create a new contact with role="guest" by default
      const newContact = {
        entityName: `${formData.firstName} ${formData.lastName}`,
        entityLabel: `${formData.firstName} ${formData.lastName}`,
        general: {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          remarks: formData.remarks,
          role: "guest", // Default role as guest
        },
      };

      // Call the server action to create the document
      const result = await createDocument("contacts", newContact);
      
      if (result.success && result.data) {
        toast.success("Guest contact created successfully");
        
        // Pass the new contact back to the parent component
        onContactCreated(
          result.data._id.toString(), 
          `${formData.firstName} ${formData.lastName}`
        );
        
        // Reset form and close modal
        setFormData(INITIAL_FORM_STATE);
        onClose();
      } else {
        console.error("Failed to create contact:", result.error);
        toast.error(`Failed to create guest contact: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldProps = (field: keyof QuickContactFormData, required = false) => ({
    value: formData[field],
    onChange: (value: string) => handleChange(field, value),
    required,
  });

  return (
    <div className="quick-add-modal-overlay">
      <div className="quick-add-modal">
        <div className="quick-add-modal-header">
          <h3>Add New Guest</h3>
          <button 
            onClick={onClose} 
            className="close-button"
            disabled={isSubmitting}
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Using div instead of form to avoid nesting forms */}
        <div className="quick-add-form-content">
          <DropdownField
            label="Title"
            options={TITLE_OPTIONS}
            {...fieldProps("title")}
            isEditing={true}
          />
          <TextField label="First Name" {...fieldProps("firstName", true)} isEditing={true} />
          <TextField label="Last Name" {...fieldProps("lastName", true)} isEditing={true} />
          <TextField label="Email" type="email" {...fieldProps("email")} isEditing={true} />
          <TextField label="Phone" type="tel" {...fieldProps("phone")} isEditing={true} />
          <TextField 
            label="Remarks" 
            multiline 
            rows={3} 
            {...fieldProps("remarks")} 
            isEditing={true} 
          />
        </div>

        <div className="quick-add-form-actions">
          <Button
            intent="secondary"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !formData.firstName || !formData.lastName}
          >
            Add Guest
          </Button>
        </div>
      </div>

      <style jsx>{`
        .quick-add-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .quick-add-modal {
          background-color: white;
          border-radius: 8px;
          width: 450px;
          max-width: 90vw;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .quick-add-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e0e0e0;
        }

        .quick-add-modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
        }

        .close-button:hover {
          background-color: #f0f0f0;
        }

        .quick-add-form-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .quick-add-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e0e0e0;
        }
      `}</style>
    </div>
  );
}