"use client";
import Button from "@/components/common/Button";
import { Save, X, Edit, Trash2 } from "lucide-react"; // Added Trash2 icon
import { useState, useEffect } from "react";
import { useContactsData } from "@/context/DataContext";
import { toast } from "sonner";
import { TextField } from "../fields/TextField";
import { DropdownField } from "../fields/DropdownField";
import { RefField } from "../fields/RefField";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "../loadingSpinner";

//delete confirmation
function DeleteConfirmationDialog({ isOpen, onClose, onConfirm, itemName }) {
  if (!isOpen) return null;

  return (
    <div className="delete-confirmation-overlay">
      <div className="delete-confirmation-dialog">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete {itemName || "this contact"}?</p>
        <p className="warning-text">This action cannot be undone.</p>
        <div className="dialog-buttons">
          <Button intent="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button intent="danger" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>

      <style jsx>{`
        .delete-confirmation-overlay {
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

        .delete-confirmation-dialog {
          background-color: white;
          border-radius: 8px;
          padding: 24px;
          width: 400px;
          max-width: 90vw;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        h3 {
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 18px;
        }

        p {
          margin-bottom: 16px;
        }

        .warning-text {
          color: #e11d48;
          font-weight: 500;
        }

        .dialog-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

interface ContactFormData {
  entityName: string;
  entityLabel: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  companyId: string;
}

interface FieldLoadingState {
  companyId: boolean;
}

const INITIAL_FORM_STATE: ContactFormData = {
  entityName: "",
  entityLabel: "",
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  companyId: "",
};

const INITIAL_LOADING_STATE: FieldLoadingState = {
  companyId: false,
};

const OPTIONS = {
  role: [
    { value: "booker", label: "Booker" },
    { value: "guest", label: "Guest" },
  ],
  title: [
    { value: "mr", label: "Mr." },
    { value: "ms", label: "Ms." },
  ],
};

export function ContactForm() {
  const {
    selectedItem,
    updateItem,
    createItem,
    deleteItem, 
    setIsEditing,
    isEditing,
    pendingChanges,
    setPendingChanges,
  } = useContactsData();

  const router = useRouter();

  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fieldsLoaded, setFieldsLoaded] = useState<FieldLoadingState>(
    INITIAL_LOADING_STATE
  );
  const [isFormLoading, setIsFormLoading] = useState(false);

  // Add these for delete functionality
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Function to check if all reference fields are loaded
  const checkAllFieldsLoaded = () => {
    const isCompanyLoaded = !formData.companyId || fieldsLoaded.companyId;
    return isCompanyLoaded;
  };

  // Update form loading state when fields load status changes
  useEffect(() => {
    const shouldShowLoading = formData.companyId && !fieldsLoaded.companyId;
    setIsFormLoading(shouldShowLoading);
  }, [formData.companyId, fieldsLoaded.companyId]);

  // Load form data when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setIsCreating(false);
      if (!selectedItem._id) {
        setIsCreating(true);
        setIsEditing(true);
      }

      setFieldsLoaded(INITIAL_LOADING_STATE);
      setIsFormLoading(!!selectedItem.general?.companyId);

      setFormData({
        entityName: selectedItem.entityName || "",
        entityLabel: selectedItem.entityLabel || "",
        title: selectedItem.general?.title || "",
        firstName: selectedItem.general?.firstName || "",
        lastName: selectedItem.general?.lastName || "",
        email: selectedItem.general?.email || "",
        phone: selectedItem.general?.phone || "",
        role: selectedItem.general?.role || "",
        companyId: selectedItem.general?.companyId || "",
      });
    }
  }, [selectedItem]);

  const handleChange = (
    field: keyof ContactFormData,
    value: string | string[],
    displayValue?: string | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(displayValue && field === "entityName"
        ? { entityLabel: displayValue }
        : {}),
    }));

    if (field === "companyId") {
      setFieldsLoaded((prev) => ({
        ...prev,
        companyId: false,
      }));
      setIsFormLoading(!!value);
    }

    setPendingChanges((prev) => {
      const oldValue =
        field === "companyId" ||
        field === "title" ||
        field === "firstName" ||
        field === "lastName" ||
        field === "email" ||
        field === "phone" ||
        field === "role"
          ? selectedItem?.general?.[field] || ""
          : selectedItem?.[field] || "";

      return {
        ...prev,
        [field]: {
          oldValue,
          newValue: value,
        },
      };
    });
  };

  const handleCompanyLoadComplete = (loaded: boolean, error?: string) => {
    if (error) {
      console.error("Company field load error:", error);
      toast.error(`Error loading company information`);
    }

    setFieldsLoaded((prev) => ({
      ...prev,
      companyId: loaded,
    }));

    setIsFormLoading(false);
  };

  const handleClose = () => {
    setPendingChanges({});
    if (isEditing) {
      setIsEditing(false);
    }

    router.push("/contacts");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const itemData = {
        ...selectedItem,
        entityName: formData.entityName,
        general: {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          companyId: formData.companyId,
        },
      };

      const isUpdate = !!selectedItem?._id;
      const success = isUpdate
        ? await updateItem(itemData)
        : await createItem(itemData);

      if (success) {
        toast.success(
          `Contact ${isUpdate ? "updated" : "created"} successfully`
        );
        setIsEditing(false);
        setIsCreating(false);
        setPendingChanges({});

        if (!isUpdate && itemData._id) {
          router.push(`/contacts/${itemData._id}`);
        }
      } else {
        toast.error(`Failed to ${isUpdate ? "update" : "create"} contact`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (selectedItem) {
      setFormData({
        entityName: selectedItem.entityName || "",
        entityLabel: selectedItem.entityLabel || "",
        title: selectedItem.general?.title || "",
        firstName: selectedItem.general?.firstName || "",
        lastName: selectedItem.general?.lastName || "",
        email: selectedItem.general?.email || "",
        phone: selectedItem.general?.phone || "",
        role: selectedItem.general?.role || "",
        companyId: selectedItem.general?.companyId || "",
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setPendingChanges({});
    setIsEditing(false);
    setIsCreating(false);

    if (isCreating) {
      router.push("/contacts");
    }
  };

  // Add delete handler functions
  const handleDeleteClick = (e) => {
    // If there's an event, prevent default behavior (like form submission)
    if (e) e.preventDefault();
    
    // Cancel editing mode first to avoid update conflict
    if (isEditing) {
      setIsEditing(false);
      setPendingChanges({});
    }
    
    // Show confirmation dialog
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem?._id) {
      toast.error("No item selected to delete");
      setShowDeleteConfirmation(false);
      return;
    }
  
    setIsDeleting(true);
    try {
      const success = await deleteItem(selectedItem._id);
      
      if (success) {
        toast.success("Contact deleted successfully");
        router.push("/contacts");
      } else {
        toast.error("Failed to delete contact");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  // Helper function to create field props
  const fieldProps = (field: keyof ContactFormData, required = false) => ({
    value: formData[field] as string,
    onChange: (value: string) => handleChange(field, value),
    isEditing: isEditing || isCreating,
    className: pendingChanges[field] ? "field-changed" : "",
    required,
  });

  // Get contact name for confirmation dialog
  const contactName =
    formData.firstName && formData.lastName
      ? `${formData.firstName} ${formData.lastName}`
      : "this contact";

  return (
    <div className="detail-wrapper">
      <LoadingSpinner isLoading={isFormLoading || isDeleting} />

      {/* Add delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={contactName}
      />

      <form
        onSubmit={handleSave}
        className={`contact-form ${!isFormLoading ? "done-loading" : ""}`}
      >
        <div className="top-bar">
          <div className="top-bar__title">
            {selectedItem?._id ? "Contact Details" : "New Contact"}
          </div>
          <div className="top-bar__edit">
            {!isEditing && selectedItem?._id && (
              <>
                <Button icon={Edit} onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button
                  intent="ghost"
                  icon={X}
                  type="button"
                  onClick={handleClose}
                >
                  Close
                </Button>
              </>
            )}

            {(isEditing || isCreating) && (
              <>
                <Button
                  intent="secondary"
                  icon={X}
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  icon={Save}
                  type="submit"
                  disabled={
                    isSubmitting ||
                    (!isCreating && Object.keys(pendingChanges).length === 0) ||
                    isFormLoading ||
                    !checkAllFieldsLoaded()
                  }
                >
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="details-content">
          <div className="col-third">
            <DropdownField
              label="Title"
              options={OPTIONS.title}
              {...fieldProps("title")}
            />
            <TextField label="First Name" {...fieldProps("firstName", true)} />
            <TextField label="Last Name" {...fieldProps("lastName", true)} />
            <TextField label="E-mail" type="email" {...fieldProps("email")} />
            <TextField label="Phone" type="tel" {...fieldProps("phone")} />
            <DropdownField
              label="Role"
              options={OPTIONS.role}
              {...fieldProps("role", true)}
            />
            <RefField
              label="Company"
              value={formData.companyId}
              onChange={(value, displayValue) =>
                handleChange("companyId", value, displayValue)
              }
              isEditing={isEditing || isCreating}
              className={pendingChanges["companyId"] ? "field-changed" : ""}
              collectionName="companies"
              displayFields={["name"]}
              onLoadComplete={handleCompanyLoadComplete}
            />
          </div>
          <div className="col-third"></div>
        </div>
        <div className="bottom-bar">
        {isEditing && !isCreating && selectedItem?._id && (
            <Button
              intent="danger"
              icon={Trash2}
              onClick={handleDeleteClick}
              disabled={isDeleting}
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
